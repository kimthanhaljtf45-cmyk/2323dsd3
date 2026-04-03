from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Any
from bson import ObjectId
from datetime import datetime, timezone, timedelta
import jwt
import hmac
import hashlib
import json
from urllib.parse import parse_qsl, unquote
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'sports_miniapp')
jwt_secret = os.environ.get('JWT_SECRET', 'your-secret-key')
telegram_bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the main app
app = FastAPI(title="АТАКА Sports Mini App API")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============== MODELS ==============

class UserRole:
    GUEST = "GUEST"
    PARENT = "PARENT"
    STUDENT = "STUDENT"  # Child/student profile
    COACH = "COACH"
    ADMIN = "ADMIN"

class UserStatus:
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"

class PaymentStatus:
    PENDING = "PENDING"
    UNDER_REVIEW = "UNDER_REVIEW"
    PAID = "PAID"
    REJECTED = "REJECTED"

class AttendanceStatus:
    PRESENT = "PRESENT"
    ABSENT = "ABSENT"
    WARNED = "WARNED"
    LATE = "LATE"
    CANCELLED = "CANCELLED"

# Auth DTOs
class MockAuthRequest(BaseModel):
    telegramId: str
    firstName: str
    lastName: Optional[str] = None
    username: Optional[str] = None

class AuthResponse(BaseModel):
    accessToken: str
    user: dict

# User DTOs
class UserOut(BaseModel):
    id: str
    telegramId: str
    firstName: str
    lastName: Optional[str] = None
    username: Optional[str] = None
    phone: Optional[str] = None
    role: str
    status: str

# Child DTOs
class ChildOut(BaseModel):
    id: str
    firstName: str
    lastName: Optional[str] = None
    birthDate: Optional[str] = None
    status: str
    note: Optional[str] = None
    groupId: Optional[str] = None
    group: Optional[dict] = None
    coach: Optional[dict] = None
    location: Optional[dict] = None

class CreateChildRequest(BaseModel):
    firstName: str
    lastName: Optional[str] = None
    birthDate: Optional[str] = None
    groupId: Optional[str] = None
    note: Optional[str] = None

# Schedule DTOs
class ScheduleItemOut(BaseModel):
    id: str
    date: str
    startTime: str
    endTime: str
    status: str
    group: Optional[dict] = None
    coach: Optional[dict] = None
    location: Optional[dict] = None

# Feed DTOs
class ContentPostOut(BaseModel):
    id: str
    title: str
    body: Optional[str] = None
    type: str
    visibility: str
    mediaUrl: Optional[str] = None
    isPinned: bool = False
    publishedAt: str
    author: Optional[dict] = None

# Payment DTOs
class PaymentOut(BaseModel):
    id: str
    childId: str
    amount: float
    currency: str
    description: str
    status: str
    dueDate: Optional[str] = None
    paidAt: Optional[str] = None
    child: Optional[dict] = None

class PaymentConfirmRequest(BaseModel):
    proofUrl: Optional[str] = None

# Attendance DTOs
class MarkAttendanceRequest(BaseModel):
    childId: str
    scheduleId: str
    date: str
    status: str
    comment: Optional[str] = None

class ReportAbsenceRequest(BaseModel):
    childId: str
    scheduleId: str
    date: str
    reason: str
    comment: Optional[str] = None

# Location DTOs
class LocationOut(BaseModel):
    id: str
    name: str
    address: str
    city: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    description: Optional[str] = None

# Group DTOs
class GroupOut(BaseModel):
    id: str
    name: str
    ageRange: str
    level: str
    capacity: int
    description: Optional[str] = None
    coachId: Optional[str] = None
    locationId: Optional[str] = None
    coach: Optional[dict] = None
    location: Optional[dict] = None

# ============== HELPERS ==============

def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == '_id':
            result['id'] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify JWT token and return current user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return serialize_doc(user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# ============== ROUTES ==============

api_router = APIRouter(prefix="/api")

# ---------- Telegram WebApp Validation ----------

def validate_telegram_init_data(init_data: str, bot_token: str) -> dict:
    """Validate Telegram WebApp initData and extract user info"""
    try:
        parsed_data = dict(parse_qsl(init_data))
        
        # Extract hash
        received_hash = parsed_data.pop('hash', None)
        if not received_hash:
            raise ValueError("Hash not found in init data")
        
        # Create data check string
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        # Create secret key
        secret_key = hmac.new(
            b"WebAppData",
            bot_token.encode(),
            hashlib.sha256
        ).digest()
        
        # Calculate hash
        calculated_hash = hmac.new(
            secret_key,
            data_check_string.encode(),
            hashlib.sha256
        ).hexdigest()
        
        # Validate hash
        if calculated_hash != received_hash:
            raise ValueError("Invalid hash")
        
        # Check auth_date (not older than 24 hours)
        auth_date = int(parsed_data.get('auth_date', 0))
        if datetime.now(timezone.utc).timestamp() - auth_date > 86400:
            raise ValueError("Auth data expired")
        
        # Parse user data
        user_data = json.loads(unquote(parsed_data.get('user', '{}')))
        return user_data
        
    except Exception as e:
        logger.error(f"Telegram init data validation error: {e}")
        raise ValueError(f"Invalid init data: {e}")

# ---------- Auth Routes ----------

class TelegramAuthRequest(BaseModel):
    initData: str
    role: Optional[str] = None  # STUDENT or PARENT (for new users)

class RegisterRequest(BaseModel):
    telegramId: str
    firstName: str
    lastName: Optional[str] = None
    username: Optional[str] = None
    role: str  # STUDENT or PARENT only

@api_router.post("/auth/telegram", response_model=AuthResponse)
async def telegram_login(req: TelegramAuthRequest):
    """Real Telegram WebApp authentication"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Telegram bot token not configured")
    
    try:
        # Validate initData
        telegram_user = validate_telegram_init_data(req.initData, telegram_bot_token)
        
        telegram_id = str(telegram_user.get('id'))
        first_name = telegram_user.get('first_name', '')
        last_name = telegram_user.get('last_name')
        username = telegram_user.get('username')
        
        users = db.users
        
        # Find existing user
        user = await users.find_one({"telegramId": telegram_id})
        
        if not user:
            # New user - check if role is provided
            if req.role and req.role in [UserRole.STUDENT, UserRole.PARENT]:
                selected_role = req.role
            else:
                # Return response indicating registration needed
                return AuthResponse(
                    accessToken="",
                    user={
                        "id": "",
                        "telegramId": telegram_id,
                        "firstName": first_name,
                        "lastName": last_name,
                        "username": username,
                        "role": None,  # No role yet - needs registration
                        "status": "PENDING_REGISTRATION"
                    }
                )
            
            new_user = {
                "telegramId": telegram_id,
                "firstName": first_name,
                "lastName": last_name,
                "username": username,
                "phone": None,
                "role": selected_role,
                "status": UserStatus.ACTIVE,
                "createdAt": datetime.now(timezone.utc),
                "updatedAt": datetime.now(timezone.utc),
            }
            result = await users.insert_one(new_user)
            user = {**new_user, "_id": result.inserted_id}
        else:
            # Update user info from Telegram
            await users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "firstName": first_name,
                    "lastName": last_name,
                    "username": username,
                    "updatedAt": datetime.now(timezone.utc)
                }}
            )
            user["firstName"] = first_name
            user["lastName"] = last_name
            user["username"] = username
        
        # Generate JWT
        token_data = {
            "sub": str(user["_id"]),
            "telegramId": user["telegramId"],
            "role": user["role"],
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        }
        access_token = jwt.encode(token_data, jwt_secret, algorithm="HS256")
        
        return AuthResponse(
            accessToken=access_token,
            user=serialize_doc(user)
        )
        
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"Telegram auth error: {e}")
        raise HTTPException(status_code=500, detail="Authentication failed")

@api_router.post("/auth/register", response_model=AuthResponse)
async def register_user(req: RegisterRequest):
    """Register new user with role selection (STUDENT or PARENT only)"""
    # Validate role - only STUDENT or PARENT allowed for self-registration
    if req.role not in [UserRole.STUDENT, UserRole.PARENT]:
        raise HTTPException(
            status_code=400, 
            detail="Можна обрати лише роль Учень або Батько. Роль Тренера призначає адміністратор."
        )
    
    users = db.users
    
    # Check if user already exists
    existing = await users.find_one({"telegramId": req.telegramId})
    if existing:
        raise HTTPException(status_code=400, detail="Користувач вже зареєстрований")
    
    # Create new user
    new_user = {
        "telegramId": req.telegramId,
        "firstName": req.firstName,
        "lastName": req.lastName,
        "username": req.username,
        "phone": None,
        "role": req.role,
        "status": UserStatus.ACTIVE,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    result = await users.insert_one(new_user)
    user = {**new_user, "_id": result.inserted_id}
    
    # Generate JWT
    token_data = {
        "sub": str(user["_id"]),
        "telegramId": user["telegramId"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    access_token = jwt.encode(token_data, jwt_secret, algorithm="HS256")
    
    return AuthResponse(
        accessToken=access_token,
        user=serialize_doc(user)
    )

@api_router.post("/auth/mock", response_model=AuthResponse)
async def mock_login(req: MockAuthRequest):
    """Demo login for testing"""
    users = db.users
    
    # Find existing user or create new
    user = await users.find_one({"telegramId": req.telegramId})
    
    if not user:
        new_user = {
            "telegramId": req.telegramId,
            "firstName": req.firstName,
            "lastName": req.lastName,
            "username": req.username,
            "phone": None,
            "role": UserRole.PARENT,
            "status": UserStatus.ACTIVE,
            "createdAt": datetime.now(timezone.utc),
            "updatedAt": datetime.now(timezone.utc),
        }
        result = await users.insert_one(new_user)
        user = {**new_user, "_id": result.inserted_id}
    
    # Generate JWT
    token_data = {
        "sub": str(user["_id"]),
        "telegramId": user["telegramId"],
        "role": user["role"],
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    access_token = jwt.encode(token_data, jwt_secret, algorithm="HS256")
    
    return AuthResponse(
        accessToken=access_token,
        user=serialize_doc(user)
    )

# ---------- Admin: Assign Coach Role ----------

class AssignRoleRequest(BaseModel):
    userId: str
    role: str

@api_router.post("/admin/assign-role")
async def assign_role(req: AssignRoleRequest, current_user: dict = Depends(get_current_user)):
    """Assign role to user (Admin only - for assigning COACH role)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Тільки адміністратор може призначати ролі")
    
    # Allow assigning any role by admin
    if req.role not in [UserRole.STUDENT, UserRole.PARENT, UserRole.COACH, UserRole.ADMIN]:
        raise HTTPException(status_code=400, detail="Невірна роль")
    
    result = await db.users.update_one(
        {"_id": ObjectId(req.userId)},
        {"$set": {"role": req.role, "updatedAt": datetime.now(timezone.utc)}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Користувача не знайдено")
    
    return {"message": f"Роль {req.role} успішно призначена"}

# ---------- Users Routes ----------

@api_router.get("/users/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@api_router.get("/users/me/dashboard")
async def get_dashboard(current_user: dict = Depends(get_current_user)):
    """Get dashboard data based on role"""
    role = current_user.get("role")
    
    if role == UserRole.PARENT:
        # Get children
        parent_children = await db.parent_children.find(
            {"parentId": current_user["id"]}
        ).to_list(100)
        child_ids = [pc["childId"] for pc in parent_children]
        
        children = []
        for cid in child_ids:
            try:
                child = await db.children.find_one({"_id": ObjectId(cid)})
                if child:
                    child_data = serialize_doc(child)
                    # Get group info
                    if child.get("groupId"):
                        group = await db.groups.find_one({"_id": ObjectId(child["groupId"])})
                        child_data["group"] = serialize_doc(group)
                    children.append(child_data)
            except:
                pass
        
        # Get pending payments
        pending_payments = []
        for child in children:
            payments = await db.payments.find({
                "childId": child["id"],
                "status": {"$in": [PaymentStatus.PENDING, PaymentStatus.UNDER_REVIEW]}
            }).to_list(10)
            pending_payments.extend([serialize_doc(p) for p in payments])
        
        # Get feed preview
        feed = await db.content_posts.find({}).sort("publishedAt", -1).limit(3).to_list(3)
        feed_preview = [serialize_doc(f) for f in feed]
        
        # Get next training
        next_training = None
        if children:
            group_ids = [c.get("groupId") for c in children if c.get("groupId")]
            if group_ids:
                today = datetime.now(timezone.utc)
                # Calculate next training from schedules
                schedules = await db.schedules.find({
                    "groupId": {"$in": group_ids},
                    "isActive": True
                }).to_list(100)
                
                # Find next occurrence
                for schedule in schedules:
                    day_of_week = schedule.get("dayOfWeek", 0)
                    days_ahead = day_of_week - today.weekday()
                    if days_ahead <= 0:
                        days_ahead += 7
                    next_date = today + timedelta(days=days_ahead)
                    
                    if next_training is None or next_date < datetime.fromisoformat(next_training["date"].replace('Z', '+00:00')):
                        group = await db.groups.find_one({"_id": ObjectId(schedule["groupId"])})
                        location = None
                        if group and group.get("locationId"):
                            location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                        
                        next_training = {
                            "id": str(schedule["_id"]),
                            "date": next_date.isoformat(),
                            "startTime": schedule.get("startTime"),
                            "endTime": schedule.get("endTime"),
                            "status": "ACTIVE",
                            "group": serialize_doc(group),
                            "location": serialize_doc(location)
                        }
        
        return {
            "nextTraining": next_training,
            "children": children,
            "pendingPayments": pending_payments,
            "feedPreview": feed_preview,
            "quickActions": ["schedule", "payments", "absence"]
        }
    
    elif role == UserRole.COACH:
        # Get coach's groups
        groups = await db.groups.find({"coachId": current_user["id"]}).to_list(100)
        groups_data = [serialize_doc(g) for g in groups]
        
        # Get today's schedules
        today = datetime.now(timezone.utc)
        day_of_week = today.weekday() + 1  # 1-7
        
        today_schedules = []
        for group in groups:
            schedules = await db.schedules.find({
                "groupId": str(group["_id"]),
                "dayOfWeek": day_of_week,
                "isActive": True
            }).to_list(10)
            for s in schedules:
                s_data = serialize_doc(s)
                s_data["group"] = serialize_doc(group)
                location = None
                if group.get("locationId"):
                    location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                s_data["location"] = serialize_doc(location)
                today_schedules.append(s_data)
        
        return {
            "todaySchedules": today_schedules,
            "groups": groups_data,
            "unmarkedAttendanceCount": 0
        }
    
    elif role == UserRole.STUDENT:
        # Student dashboard - get their own profile
        # Find child record linked to this user
        child = await db.children.find_one({"userId": current_user["id"]})
        
        if not child:
            # Try to find by telegramId match
            child = await db.children.find_one({"telegramId": current_user.get("telegramId")})
        
        if not child:
            return {
                "profile": None,
                "message": "Профіль учня не знайдено. Зверніться до адміністратора."
            }
        
        child_data = serialize_doc(child)
        
        # Get group info
        group = None
        coach = None
        location = None
        if child.get("groupId"):
            group = await db.groups.find_one({"_id": ObjectId(child["groupId"])})
            if group:
                child_data["group"] = serialize_doc(group)
                if group.get("coachId"):
                    coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
                    child_data["coach"] = serialize_doc(coach)
                if group.get("locationId"):
                    location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                    child_data["location"] = serialize_doc(location)
        
        # Get attendance stats
        attendance = await db.attendance.find({"childId": str(child["_id"])}).to_list(100)
        total = len(attendance)
        present = len([a for a in attendance if a.get("status") == AttendanceStatus.PRESENT])
        warned = len([a for a in attendance if a.get("status") == AttendanceStatus.WARNED])
        absent = len([a for a in attendance if a.get("status") == AttendanceStatus.ABSENT])
        
        child_data["attendance"] = {
            "monthTotal": total,
            "present": present,
            "warned": warned,
            "absent": absent,
            "percent": round((present / total * 100) if total > 0 else 0)
        }
        
        # Monthly goal
        child_data["goal"] = {
            "target": 12,
            "current": present
        }
        
        # Coach comment
        child_data["coachComment"] = child.get("note", "")
        
        # Achievements
        achievements = await db.achievements.find({"childId": str(child["_id"])}).to_list(20)
        child_data["achievements"] = [serialize_doc(a) for a in achievements]
        
        # Next training
        next_training = None
        if child.get("groupId"):
            today = datetime.now(timezone.utc)
            schedules = await db.schedules.find({
                "groupId": child["groupId"],
                "isActive": True
            }).to_list(100)
            
            for schedule in schedules:
                day_of_week = schedule.get("dayOfWeek", 0)
                days_ahead = day_of_week - today.weekday()
                if days_ahead <= 0:
                    days_ahead += 7
                next_date = today + timedelta(days=days_ahead)
                
                if next_training is None or next_date < datetime.fromisoformat(next_training["date"].replace('Z', '+00:00')):
                    next_training = {
                        "id": str(schedule["_id"]),
                        "date": next_date.isoformat(),
                        "startTime": schedule.get("startTime"),
                        "endTime": schedule.get("endTime"),
                        "status": "ACTIVE",
                        "group": serialize_doc(group),
                        "location": serialize_doc(location)
                    }
        
        # Get feed for student's group
        feed = await db.content_posts.find({
            "$or": [
                {"visibility": "GLOBAL"},
                {"groupId": child.get("groupId")}
            ]
        }).sort("publishedAt", -1).limit(5).to_list(5)
        
        return {
            "profile": child_data,
            "nextTraining": next_training,
            "feedPreview": [serialize_doc(f) for f in feed],
            "quickActions": ["schedule", "progress", "achievements"]
        }
    
    else:  # ADMIN
        # Get counts
        students_count = await db.children.count_documents({})
        parents_count = await db.users.count_documents({"role": UserRole.PARENT})
        coaches_count = await db.users.count_documents({"role": UserRole.COACH})
        pending_payments = await db.payments.count_documents({"status": PaymentStatus.PENDING})
        
        return {
            "studentsCount": students_count,
            "parentsCount": parents_count,
            "coachesCount": coaches_count,
            "pendingPaymentsCount": pending_payments
        }

# ---------- Children Routes ----------

@api_router.get("/children")
async def get_my_children(current_user: dict = Depends(get_current_user)):
    """Get children for current parent"""
    parent_children = await db.parent_children.find(
        {"parentId": current_user["id"]}
    ).to_list(100)
    
    children = []
    for pc in parent_children:
        try:
            child = await db.children.find_one({"_id": ObjectId(pc["childId"])})
            if child:
                child_data = serialize_doc(child)
                # Get group info
                if child.get("groupId"):
                    group = await db.groups.find_one({"_id": ObjectId(child["groupId"])})
                    if group:
                        child_data["group"] = serialize_doc(group)
                        # Get coach
                        if group.get("coachId"):
                            coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
                            child_data["coach"] = serialize_doc(coach)
                        # Get location
                        if group.get("locationId"):
                            location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                            child_data["location"] = serialize_doc(location)
                children.append(child_data)
        except Exception as e:
            logger.error(f"Error fetching child: {e}")
    
    return children

@api_router.get("/children/{child_id}")
async def get_child(child_id: str, current_user: dict = Depends(get_current_user)):
    """Get single child details"""
    try:
        child = await db.children.find_one({"_id": ObjectId(child_id)})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        child_data = serialize_doc(child)
        
        # Get group info
        if child.get("groupId"):
            group = await db.groups.find_one({"_id": ObjectId(child["groupId"])})
            if group:
                child_data["group"] = serialize_doc(group)
                if group.get("coachId"):
                    coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
                    child_data["coach"] = serialize_doc(coach)
                if group.get("locationId"):
                    location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                    child_data["location"] = serialize_doc(location)
        
        # Get attendance stats
        attendance = await db.attendance.find({"childId": child_id}).to_list(100)
        total = len(attendance)
        present = len([a for a in attendance if a.get("status") == AttendanceStatus.PRESENT])
        warned = len([a for a in attendance if a.get("status") == AttendanceStatus.WARNED])
        absent = len([a for a in attendance if a.get("status") == AttendanceStatus.ABSENT])
        
        child_data["attendance"] = {
            "monthTotal": total,
            "present": present,
            "warned": warned,
            "absent": absent,
            "percent": round((present / total * 100) if total > 0 else 0)
        }
        
        # Get monthly goal (mock)
        child_data["goal"] = {
            "target": 12,
            "current": present
        }
        
        # Get coach comment (mock)
        child_data["coachComment"] = child.get("note", "")
        
        # Get achievements (mock)
        child_data["achievements"] = []
        
        # Get payments
        payments = await db.payments.find({"childId": child_id}).to_list(10)
        child_data["payments"] = [serialize_doc(p) for p in payments]
        
        return child_data
    except Exception as e:
        logger.error(f"Error fetching child: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/children")
async def create_child(req: CreateChildRequest, current_user: dict = Depends(get_current_user)):
    """Create new child for current parent"""
    if current_user.get("role") != UserRole.PARENT:
        raise HTTPException(status_code=403, detail="Тільки батьки можуть додавати дітей")
    
    new_child = {
        "firstName": req.firstName,
        "lastName": req.lastName,
        "birthDate": req.birthDate,
        "status": UserStatus.ACTIVE,
        "note": req.note,
        "groupId": req.groupId,
        "createdAt": datetime.now(timezone.utc),
        "updatedAt": datetime.now(timezone.utc),
    }
    
    result = await db.children.insert_one(new_child)
    child_id = str(result.inserted_id)
    
    # Link to parent
    await db.parent_children.insert_one({
        "parentId": current_user["id"],
        "childId": child_id,
        "relation": "parent",
        "createdAt": datetime.now(timezone.utc),
    })
    
    return {"id": child_id, **new_child}

class UpdateChildRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    birthDate: Optional[str] = None
    groupId: Optional[str] = None
    note: Optional[str] = None

@api_router.patch("/children/{child_id}")
async def update_child(child_id: str, req: UpdateChildRequest, current_user: dict = Depends(get_current_user)):
    """Update child (parent only)"""
    # Verify parent owns this child
    parent_child = await db.parent_children.find_one({
        "parentId": current_user["id"],
        "childId": child_id
    })
    
    if not parent_child and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Ви не можете редагувати цю дитину")
    
    update_data = {"updatedAt": datetime.now(timezone.utc)}
    if req.firstName is not None:
        update_data["firstName"] = req.firstName
    if req.lastName is not None:
        update_data["lastName"] = req.lastName
    if req.birthDate is not None:
        update_data["birthDate"] = req.birthDate
    if req.groupId is not None:
        update_data["groupId"] = req.groupId
    if req.note is not None:
        update_data["note"] = req.note
    
    result = await db.children.update_one(
        {"_id": ObjectId(child_id)},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Дитину не знайдено")
    
    return {"message": "Дитину оновлено"}

@api_router.delete("/children/{child_id}")
async def delete_child(child_id: str, current_user: dict = Depends(get_current_user)):
    """Delete child (parent only)"""
    # Verify parent owns this child
    parent_child = await db.parent_children.find_one({
        "parentId": current_user["id"],
        "childId": child_id
    })
    
    if not parent_child and current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Ви не можете видалити цю дитину")
    
    # Delete child and link
    await db.children.delete_one({"_id": ObjectId(child_id)})
    await db.parent_children.delete_many({"childId": child_id})
    
    return {"message": "Дитину видалено"}

# ---------- Schedule Routes ----------

@api_router.get("/schedule")
async def get_schedule(
    groupId: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get schedule"""
    query = {"isActive": True}
    if groupId:
        query["groupId"] = groupId
    
    schedules = await db.schedules.find(query).to_list(100)
    
    result = []
    today = datetime.now(timezone.utc)
    
    for schedule in schedules:
        s_data = serialize_doc(schedule)
        
        # Get group
        if schedule.get("groupId"):
            group = await db.groups.find_one({"_id": ObjectId(schedule["groupId"])})
            if group:
                s_data["group"] = serialize_doc(group)
                if group.get("coachId"):
                    coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
                    s_data["coach"] = serialize_doc(coach)
                if group.get("locationId"):
                    location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                    s_data["location"] = serialize_doc(location)
        
        # Calculate next dates for this schedule
        day_of_week = schedule.get("dayOfWeek", 0)
        for i in range(3):  # Next 3 occurrences
            days_ahead = day_of_week - today.weekday()
            if days_ahead <= 0:
                days_ahead += 7
            days_ahead += i * 7
            next_date = today + timedelta(days=days_ahead)
            
            result.append({
                **s_data,
                "date": next_date.strftime("%Y-%m-%d"),
                "status": "ACTIVE"
            })
    
    # Sort by date
    result.sort(key=lambda x: x["date"])
    
    return result

# ---------- Feed Routes ----------

@api_router.get("/content/feed")
async def get_feed(
    filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get content feed"""
    query = {}
    if filter and filter != "all":
        type_map = {
            "news": "NEWS",
            "events": "EVENT",
            "announcement": "ANNOUNCEMENT"
        }
        if filter in type_map:
            query["type"] = type_map[filter]
    
    posts = await db.content_posts.find(query).sort("publishedAt", -1).to_list(50)
    
    result = []
    for post in posts:
        post_data = serialize_doc(post)
        # Get author
        if post.get("authorId"):
            try:
                author = await db.users.find_one({"_id": ObjectId(post["authorId"])})
                post_data["author"] = serialize_doc(author)
            except:
                pass
        result.append(post_data)
    
    return result

# ---------- Payments Routes ----------

@api_router.get("/payments")
async def get_payments(current_user: dict = Depends(get_current_user)):
    """Get payments for current user's children"""
    # Get children
    parent_children = await db.parent_children.find(
        {"parentId": current_user["id"]}
    ).to_list(100)
    child_ids = [pc["childId"] for pc in parent_children]
    
    payments = await db.payments.find(
        {"childId": {"$in": child_ids}}
    ).sort("dueDate", -1).to_list(100)
    
    result = []
    for payment in payments:
        p_data = serialize_doc(payment)
        # Get child info
        try:
            child = await db.children.find_one({"_id": ObjectId(payment["childId"])})
            p_data["child"] = serialize_doc(child)
        except:
            pass
        result.append(p_data)
    
    return result

@api_router.get("/payments/{payment_id}")
async def get_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    """Get single payment"""
    try:
        payment = await db.payments.find_one({"_id": ObjectId(payment_id)})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        p_data = serialize_doc(payment)
        try:
            child = await db.children.find_one({"_id": ObjectId(payment["childId"])})
            p_data["child"] = serialize_doc(child)
        except:
            pass
        
        return p_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payments/{payment_id}/confirm")
async def confirm_payment(
    payment_id: str,
    req: PaymentConfirmRequest,
    current_user: dict = Depends(get_current_user)
):
    """Confirm payment (upload proof)"""
    result = await db.payments.update_one(
        {"_id": ObjectId(payment_id)},
        {
            "$set": {
                "status": PaymentStatus.UNDER_REVIEW,
                "proofUrl": req.proofUrl,
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment confirmation submitted"}

# ---------- Attendance Routes ----------

@api_router.post("/attendance/mark")
async def mark_attendance(req: MarkAttendanceRequest, current_user: dict = Depends(get_current_user)):
    """Mark attendance (for coaches)"""
    if current_user.get("role") not in [UserRole.COACH, UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only coaches can mark attendance")
    
    attendance = {
        "childId": req.childId,
        "scheduleId": req.scheduleId,
        "date": req.date,
        "status": req.status,
        "comment": req.comment,
        "markedByCoachId": current_user["id"],
        "createdAt": datetime.now(timezone.utc),
    }
    
    # Upsert
    await db.attendance.update_one(
        {"childId": req.childId, "scheduleId": req.scheduleId, "date": req.date},
        {"$set": attendance},
        upsert=True
    )
    
    return {"message": "Attendance marked"}

@api_router.post("/attendance/report-absence")
async def report_absence(req: ReportAbsenceRequest, current_user: dict = Depends(get_current_user)):
    """Report absence (for parents)"""
    attendance = {
        "childId": req.childId,
        "scheduleId": req.scheduleId,
        "date": req.date,
        "status": AttendanceStatus.WARNED,
        "reason": req.reason,
        "comment": req.comment,
        "reportedByParentId": current_user["id"],
        "createdAt": datetime.now(timezone.utc),
    }
    
    # Upsert
    await db.attendance.update_one(
        {"childId": req.childId, "scheduleId": req.scheduleId, "date": req.date},
        {"$set": attendance},
        upsert=True
    )
    
    return {"message": "Absence reported"}

@api_router.get("/attendance/child/{child_id}")
async def get_child_attendance(child_id: str, current_user: dict = Depends(get_current_user)):
    """Get attendance history for a child"""
    attendance = await db.attendance.find(
        {"childId": child_id}
    ).sort("date", -1).to_list(100)
    
    return [serialize_doc(a) for a in attendance]

# ---------- Locations Routes ----------

@api_router.get("/locations")
async def get_locations():
    """Get all locations"""
    locations = await db.locations.find({}).to_list(100)
    return [serialize_doc(loc) for loc in locations]

@api_router.get("/locations/{location_id}")
async def get_location(location_id: str):
    """Get single location"""
    location = await db.locations.find_one({"_id": ObjectId(location_id)})
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return serialize_doc(location)

# ---------- Groups Routes ----------

@api_router.get("/groups")
async def get_groups():
    """Get all groups"""
    groups = await db.groups.find({}).to_list(100)
    
    result = []
    for group in groups:
        g_data = serialize_doc(group)
        if group.get("coachId"):
            try:
                coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
                g_data["coach"] = serialize_doc(coach)
            except:
                pass
        if group.get("locationId"):
            try:
                location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                g_data["location"] = serialize_doc(location)
            except:
                pass
        result.append(g_data)
    
    return result

@api_router.get("/groups/{group_id}")
async def get_group(group_id: str):
    """Get single group"""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    g_data = serialize_doc(group)
    if group.get("coachId"):
        try:
            coach = await db.users.find_one({"_id": ObjectId(group["coachId"])})
            g_data["coach"] = serialize_doc(coach)
        except:
            pass
    if group.get("locationId"):
        try:
            location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
            g_data["location"] = serialize_doc(location)
        except:
            pass
    
    return g_data

@api_router.get("/groups/{group_id}/children")
async def get_group_children(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get children in a group (for coaches)"""
    children = await db.children.find({"groupId": group_id}).to_list(100)
    return [serialize_doc(c) for c in children]

# ---------- Coach Routes ----------

@api_router.get("/coaches/me/dashboard")
async def get_coach_dashboard(current_user: dict = Depends(get_current_user)):
    """Get coach dashboard"""
    if current_user.get("role") != UserRole.COACH:
        raise HTTPException(status_code=403, detail="Only for coaches")
    
    # Get coach's groups
    groups = await db.groups.find({"coachId": current_user["id"]}).to_list(100)
    groups_data = []
    
    for group in groups:
        g_data = serialize_doc(group)
        if group.get("locationId"):
            location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
            g_data["location"] = serialize_doc(location)
        groups_data.append(g_data)
    
    # Get today's schedules
    today = datetime.now(timezone.utc)
    day_of_week = today.weekday() + 1
    
    today_schedules = []
    for group in groups:
        schedules = await db.schedules.find({
            "groupId": str(group["_id"]),
            "dayOfWeek": day_of_week,
            "isActive": True
        }).to_list(10)
        
        for s in schedules:
            s_data = serialize_doc(s)
            s_data["group"] = serialize_doc(group)
            s_data["date"] = today.strftime("%Y-%m-%d")
            if group.get("locationId"):
                location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
                s_data["location"] = serialize_doc(location)
            
            # Get children for this group
            children = await db.children.find({"groupId": str(group["_id"])}).to_list(100)
            s_data["children"] = [serialize_doc(c) for c in children]
            
            today_schedules.append(s_data)
    
    return {
        "todaySchedules": today_schedules,
        "groups": groups_data,
        "unmarkedAttendanceCount": 0
    }

# ---------- Admin Routes ----------

@api_router.get("/admin/dashboard")
async def get_admin_dashboard(current_user: dict = Depends(get_current_user)):
    """Get admin dashboard"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    students_count = await db.children.count_documents({"status": UserStatus.ACTIVE})
    parents_count = await db.users.count_documents({"role": UserRole.PARENT})
    coaches_count = await db.users.count_documents({"role": UserRole.COACH})
    groups_count = await db.groups.count_documents({})
    
    pending_payments = await db.payments.count_documents({"status": PaymentStatus.PENDING})
    paid_payments = await db.payments.count_documents({"status": PaymentStatus.PAID})
    
    trial_leads = await db.trial_leads.count_documents({"status": "new"}) if await db.list_collection_names() else 0
    
    return {
        "studentsCount": students_count,
        "parentsCount": parents_count,
        "coachesCount": coaches_count,
        "groupsCount": groups_count,
        "pendingPaymentsCount": pending_payments,
        "paidPaymentsCount": paid_payments,
        "newTrialLeadsCount": trial_leads
    }

@api_router.get("/admin/students")
async def get_all_students(current_user: dict = Depends(get_current_user)):
    """Get all students (admin only)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    children = await db.children.find({}).to_list(1000)
    result = []
    for child in children:
        c_data = serialize_doc(child)
        if child.get("groupId"):
            group = await db.groups.find_one({"_id": ObjectId(child["groupId"])})
            c_data["group"] = serialize_doc(group)
        result.append(c_data)
    
    return result

@api_router.get("/admin/payments")
async def get_all_payments(current_user: dict = Depends(get_current_user)):
    """Get all payments (admin only)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    payments = await db.payments.find({}).sort("dueDate", -1).to_list(1000)
    result = []
    for p in payments:
        p_data = serialize_doc(p)
        try:
            child = await db.children.find_one({"_id": ObjectId(p["childId"])})
            p_data["child"] = serialize_doc(child)
        except:
            pass
        result.append(p_data)
    
    return result

@api_router.post("/admin/payments/{payment_id}/approve")
async def approve_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    """Approve payment (admin only)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    result = await db.payments.update_one(
        {"_id": ObjectId(payment_id)},
        {
            "$set": {
                "status": PaymentStatus.PAID,
                "paidAt": datetime.now(timezone.utc),
                "approvedById": current_user["id"],
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment approved"}

@api_router.post("/admin/payments/{payment_id}/reject")
async def reject_payment(payment_id: str, current_user: dict = Depends(get_current_user)):
    """Reject payment (admin only)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    result = await db.payments.update_one(
        {"_id": ObjectId(payment_id)},
        {
            "$set": {
                "status": PaymentStatus.REJECTED,
                "updatedAt": datetime.now(timezone.utc)
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    return {"message": "Payment rejected"}

# ---------- Trial Routes ----------

class TrialLeadRequest(BaseModel):
    childName: str
    childAge: int
    parentName: str
    phone: str
    preferredLocationId: Optional[str] = None
    note: Optional[str] = None

@api_router.post("/trial")
async def submit_trial_lead(req: TrialLeadRequest):
    """Submit trial lesson request"""
    lead = {
        "childName": req.childName,
        "childAge": req.childAge,
        "parentName": req.parentName,
        "phone": req.phone,
        "preferredLocationId": req.preferredLocationId,
        "note": req.note,
        "status": "new",
        "createdAt": datetime.now(timezone.utc),
    }
    
    result = await db.trial_leads.insert_one(lead)
    
    return {"id": str(result.inserted_id), "message": "Заявку прийнято!"}

# ---------- Health Check ----------

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}

# ---------- Telegram Bot Routes ----------

@api_router.get("/telegram/bot-info")
async def get_bot_info():
    """Get Telegram bot info"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.telegram.org/bot{telegram_bot_token}/getMe"
            )
            data = response.json()
            if data.get("ok"):
                return data["result"]
            raise HTTPException(status_code=500, detail=data.get("description", "Unknown error"))
    except Exception as e:
        logger.error(f"Bot info error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/set-menu-button")
async def set_menu_button():
    """Set Mini App menu button for the bot"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    try:
        webapp_url = os.environ.get('APP_URL', 'https://b092756e-b197-4f33-9cec-81dfc8f48cc3.preview.emergentagent.com')
        
        async with httpx.AsyncClient() as client:
            # Set chat menu button
            response = await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/setChatMenuButton",
                json={
                    "menu_button": {
                        "type": "web_app",
                        "text": "Відкрити АТАКУ",
                        "web_app": {
                            "url": webapp_url
                        }
                    }
                }
            )
            data = response.json()
            if not data.get("ok"):
                raise HTTPException(status_code=500, detail=data.get("description", "Unknown error"))
            
            return {"message": "Menu button set successfully", "url": webapp_url}
    except Exception as e:
        logger.error(f"Set menu button error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class SendNotificationRequest(BaseModel):
    telegramId: str
    message: str

@api_router.post("/telegram/send-notification")
async def send_telegram_notification(req: SendNotificationRequest, current_user: dict = Depends(get_current_user)):
    """Send notification to user via Telegram (admin/coach only)"""
    if current_user.get("role") not in [UserRole.ADMIN, UserRole.COACH]:
        raise HTTPException(status_code=403, detail="Only for admins and coaches")
    
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                json={
                    "chat_id": req.telegramId,
                    "text": req.message,
                    "parse_mode": "HTML"
                }
            )
            data = response.json()
            if not data.get("ok"):
                raise HTTPException(status_code=500, detail=data.get("description", "Unknown error"))
            
            # Log notification
            await db.notifications.insert_one({
                "userId": req.telegramId,
                "type": "TELEGRAM_MESSAGE",
                "title": "Повідомлення",
                "body": req.message,
                "isRead": False,
                "sentBy": current_user["id"],
                "createdAt": datetime.now(timezone.utc)
            })
            
            return {"message": "Notification sent successfully"}
    except Exception as e:
        logger.error(f"Send notification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/telegram/send-training-reminder")
async def send_training_reminders(current_user: dict = Depends(get_current_user)):
    """Send training reminders to all parents (admin only)"""
    if current_user.get("role") != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only for admins")
    
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    # Get tomorrow's schedules
    tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
    day_of_week = tomorrow.weekday() + 1
    
    schedules = await db.schedules.find({
        "dayOfWeek": day_of_week,
        "isActive": True
    }).to_list(100)
    
    sent_count = 0
    
    for schedule in schedules:
        group_id = schedule.get("groupId")
        if not group_id:
            continue
        
        # Get group info
        group = await db.groups.find_one({"_id": ObjectId(group_id)})
        if not group:
            continue
        
        # Get location
        location = None
        if group.get("locationId"):
            location = await db.locations.find_one({"_id": ObjectId(group["locationId"])})
        
        # Get children in this group
        children = await db.children.find({"groupId": group_id}).to_list(100)
        
        for child in children:
            # Get parent
            parent_child = await db.parent_children.find_one({"childId": str(child["_id"])})
            if not parent_child:
                continue
            
            parent = await db.users.find_one({"_id": ObjectId(parent_child["parentId"])})
            if not parent or not parent.get("telegramId"):
                continue
            
            # Send reminder
            message = f"""🥋 <b>Нагадування про тренування</b>

<b>Завтра</b> о <b>{schedule.get('startTime')}</b>

👶 {child.get('firstName')} {child.get('lastName', '')}
📍 {location.get('name') if location else 'Зал'}
🏫 {group.get('name')}

Чекаємо на тренуванні! 💪"""

            try:
                async with httpx.AsyncClient() as client:
                    await client.post(
                        f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                        json={
                            "chat_id": parent["telegramId"],
                            "text": message,
                            "parse_mode": "HTML"
                        }
                    )
                    sent_count += 1
            except Exception as e:
                logger.error(f"Failed to send reminder to {parent['telegramId']}: {e}")
    
    return {"message": f"Sent {sent_count} reminders"}

# ---------- Telegram Webhook for Bot Commands ----------

class TelegramUpdate(BaseModel):
    update_id: int
    message: Optional[dict] = None

@api_router.post("/telegram/webhook")
async def telegram_webhook(update: TelegramUpdate):
    """Handle incoming Telegram bot updates (commands like /start)"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    if not update.message:
        return {"ok": True}
    
    message = update.message
    chat_id = message.get("chat", {}).get("id")
    text = message.get("text", "")
    user = message.get("from", {})
    
    if not chat_id:
        return {"ok": True}
    
    # Handle /start command
    if text.startswith("/start"):
        first_name = user.get("first_name", "")
        
        welcome_message = f"""🥋 <b>Вітаємо в АТАЦІ, {first_name}!</b>

Це офіційний Mini App школи єдиноборств <b>Team Kostenko</b>.

━━━━━━━━━━━━━━━━━━━━

<b>🎯 Що таке АТАКА?</b>

АТАКА — це не просто школа єдиноборств. Це система виховання, де кожна дитина проходить шлях від новачка до справжнього воїна.

Ми віримо, що спорт — це фундамент характеру. Тхеквондо вчить:
• Поважати суперника
• Контролювати емоції  
• Досягати цілей крок за кроком
• Ніколи не здаватися

━━━━━━━━━━━━━━━━━━━━

<b>✨ Можливості додатку:</b>

📅 <b>Розклад</b> — завжди знайте, коли тренування
📊 <b>Прогрес</b> — відстежуйте досягнення
💳 <b>Оплата</b> — зручна оплата абонементів
📰 <b>Новини</b> — події та турніри

━━━━━━━━━━━━━━━━━━━━

<b>👥 Для кого?</b>

🧒 <b>Учні</b> — відстежуй свій прогрес
👨‍👩‍👧 <b>Батьки</b> — контролюйте дитину

━━━━━━━━━━━━━━━━━━━━

<b>📍 Наші зали у Києві:</b>

🏢 <b>Позняки</b> — Анни Ахматової, 13В
🏢 <b>Відрадний</b> — Новопольова, 106
🏢 <b>Шалімова</b> — Академіка Шалімова, 43
🏢 <b>Соломʼянка</b> — Авіаконструктора Антонова, 4

━━━━━━━━━━━━━━━━━━━━

<b>🚀 Готові почати?</b>

Натисніть <b>«Відкрити АТАКУ»</b> нижче!

<i>Виховуємо силу. Дисципліну. Характер.</i> 💪"""

        # Send welcome message with menu button
        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": welcome_message,
                    "parse_mode": "HTML",
                    "reply_markup": {
                        "inline_keyboard": [[
                            {
                                "text": "🥋 Відкрити АТАКУ",
                                "web_app": {
                                    "url": os.environ.get('APP_URL', 'https://b092756e-b197-4f33-9cec-81dfc8f48cc3.preview.emergentagent.com')
                                }
                            }
                        ], [
                            {
                                "text": "📞 Записатись на пробне",
                                "callback_data": "trial"
                            }
                        ]]
                    }
                }
            )
        
        # Log the interaction
        await db.bot_interactions.insert_one({
            "chat_id": chat_id,
            "user_id": user.get("id"),
            "username": user.get("username"),
            "first_name": first_name,
            "command": "/start",
            "createdAt": datetime.now(timezone.utc)
        })
    
    # Handle /help command
    elif text.startswith("/help"):
        help_message = """🥋 <b>АТАКА — Довідка</b>

<b>Доступні команди:</b>

/start — Привітання та інформація про школу
/help — Ця довідка
/schedule — Переглянути розклад
/contact — Контакти школи

<b>Як користуватися?</b>

1️⃣ Натисніть кнопку меню внизу
2️⃣ Оберіть «Відкрити АТАКУ»
3️⃣ Увійдіть як батько, тренер або адмін

<b>Потрібна допомога?</b>
Напишіть нам: @ataka_support"""

        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": help_message,
                    "parse_mode": "HTML"
                }
            )
    
    # Handle /schedule command
    elif text.startswith("/schedule"):
        schedule_message = """📅 <b>Розклад занять</b>

<b>Зал Оболонь:</b>
• Діти 6-8 років: Вт, Чт 17:00, Сб 10:00
• Діти 9-12 років: Вт, Чт 18:30

<b>Зал Позняки:</b>
• Підлітки 13-16: Пн, Ср, Пт 19:00

Детальніше — у додатку 👇"""

        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": schedule_message,
                    "parse_mode": "HTML",
                    "reply_markup": {
                        "inline_keyboard": [[
                            {
                                "text": "📅 Відкрити розклад",
                                "web_app": {
                                    "url": os.environ.get('APP_URL', 'https://b092756e-b197-4f33-9cec-81dfc8f48cc3.preview.emergentagent.com') + "/schedule"
                                }
                            }
                        ]]
                    }
                }
            )
    
    # Handle /contact command
    elif text.startswith("/contact"):
        contact_message = """📞 <b>Контакти АТАКА</b>

<b>Телефон:</b> +380 50 123 45 67
<b>Email:</b> info@ataka.kyiv.ua

<b>Зали:</b>
📍 Оболонь — вул. Героїв Дніпра, 15
📍 Позняки — вул. Драгоманова, 23

<b>Соціальні мережі:</b>
Instagram: @ataka_team_kostenko
Facebook: АТАКА Team Kostenko

Чекаємо на вас! 🥋"""

        async with httpx.AsyncClient() as client:
            await client.post(
                f"https://api.telegram.org/bot{telegram_bot_token}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": contact_message,
                    "parse_mode": "HTML"
                }
            )
    
    return {"ok": True}

@api_router.post("/telegram/set-webhook")
async def set_telegram_webhook():
    """Set webhook URL for the bot"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    webhook_url = os.environ.get('APP_URL', 'https://b092756e-b197-4f33-9cec-81dfc8f48cc3.preview.emergentagent.com') + "/api/telegram/webhook"
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.telegram.org/bot{telegram_bot_token}/setWebhook",
            json={"url": webhook_url}
        )
        data = response.json()
        
        if not data.get("ok"):
            raise HTTPException(status_code=500, detail=data.get("description", "Unknown error"))
        
        return {"message": "Webhook set successfully", "url": webhook_url}

@api_router.post("/telegram/set-commands")
async def set_bot_commands():
    """Set bot commands menu"""
    if not telegram_bot_token:
        raise HTTPException(status_code=500, detail="Bot token not configured")
    
    commands = [
        {"command": "start", "description": "🏠 Головна — привітання та інформація"},
        {"command": "help", "description": "❓ Допомога — як користуватися"},
        {"command": "schedule", "description": "📅 Розклад — перегляд занять"},
        {"command": "contact", "description": "📞 Контакти — зв'язатися з нами"}
    ]
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api.telegram.org/bot{telegram_bot_token}/setMyCommands",
            json={"commands": commands}
        )
        data = response.json()
        
        if not data.get("ok"):
            raise HTTPException(status_code=500, detail=data.get("description", "Unknown error"))
        
        return {"message": "Commands set successfully", "commands": commands}

# Include router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
