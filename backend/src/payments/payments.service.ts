import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { CreatePaymentDto, ConfirmPaymentDto } from './dto/payments.dto';
import { PaymentStatus } from '../common/enums';

@Injectable()
export class PaymentsService {
  constructor(@Inject('DATABASE_CONNECTION') private readonly db: Db) {}

  async listForParent(parentId: string) {
    const parentChildren = this.db.collection('parent_children');
    const payments = this.db.collection('payments');
    const children = this.db.collection('children');

    const links = await parentChildren.find({ parentId }).toArray();
    const childIds = links.map(l => l.childId);

    if (childIds.length === 0) return [];

    const paymentDocs = await payments
      .find({ childId: { $in: childIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const childDocs = await children.find({ 
      _id: { $in: childIds.map(id => new ObjectId(id)) } 
    }).toArray();

    return paymentDocs.map(p => {
      const child = childDocs.find(c => c._id.toString() === p.childId);
      return {
        id: p._id.toString(),
        childId: p.childId,
        child: child ? {
          id: child._id.toString(),
          firstName: child.firstName,
          lastName: child.lastName,
        } : null,
        amount: p.amount,
        currency: p.currency,
        description: p.description,
        status: p.status,
        proofUrl: p.proofUrl,
        dueDate: p.dueDate,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
      };
    });
  }

  async create(dto: CreatePaymentDto) {
    const payments = this.db.collection('payments');

    const newPayment = {
      childId: dto.childId,
      amount: dto.amount,
      currency: 'UAH',
      description: dto.description || null,
      status: PaymentStatus.PENDING,
      proofUrl: null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      paidAt: null,
      approvedById: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await payments.insertOne(newPayment);

    return {
      id: result.insertedId.toString(),
      ...newPayment,
    };
  }

  async confirmByParent(parentId: string, dto: ConfirmPaymentDto) {
    const payments = this.db.collection('payments');
    const parentChildren = this.db.collection('parent_children');

    const payment = await payments.findOne({ _id: new ObjectId(dto.paymentId) });
    if (!payment) {
      throw new ForbiddenException('Payment not found');
    }

    const relation = await parentChildren.findOne({
      parentId,
      childId: payment.childId,
    });

    if (!relation) {
      throw new ForbiddenException('No access to this payment');
    }

    const result = await payments.findOneAndUpdate(
      { _id: new ObjectId(dto.paymentId) },
      {
        $set: {
          proofUrl: dto.proofUrl || null,
          status: PaymentStatus.UNDER_REVIEW,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return {
      id: result._id.toString(),
      childId: result.childId,
      amount: result.amount,
      status: result.status,
      proofUrl: result.proofUrl,
    };
  }

  async approve(adminId: string, paymentId: string) {
    const payments = this.db.collection('payments');

    const result = await payments.findOneAndUpdate(
      { _id: new ObjectId(paymentId) },
      {
        $set: {
          status: PaymentStatus.PAID,
          approvedById: adminId,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' },
    );

    return {
      id: result._id.toString(),
      childId: result.childId,
      amount: result.amount,
      status: result.status,
      paidAt: result.paidAt,
    };
  }
}
