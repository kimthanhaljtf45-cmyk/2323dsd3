"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

const statusConfig: Record<string, { label: string; variant: any; icon: any }> = {
  PENDING: { label: "Очікує оплати", variant: "warning", icon: Clock },
  UNDER_REVIEW: { label: "На перевірці", variant: "default", icon: Clock },
  PAID: { label: "Оплачено", variant: "success", icon: CheckCircle },
  REJECTED: { label: "Відхилено", variant: "danger", icon: XCircle },
};

export default function PaymentsPage() {
  const { payments, fetchPayments } = useStore();

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const pendingPayments = payments.filter(
    p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW'
  );
  const paidPayments = payments.filter(p => p.status === 'PAID');

  return (
    <div className="min-h-screen" data-testid="payments-page">
      <Header title="Оплати" />
      
      <div className="pt-20 px-4 space-y-6">
        {/* Summary */}
        {pendingPayments.length > 0 && (
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-warning" />
                <div>
                  <p className="font-semibold">
                    {formatCurrency(pendingPayments.reduce((acc, p) => acc + p.amount, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pendingPayments.length} рахунків до оплати
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Payments */}
        {pendingPayments.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-semibold mb-4">До оплати</h2>
            <div className="space-y-3">
              {pendingPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </section>
        )}

        {/* Payment History */}
        {paidPayments.length > 0 && (
          <section>
            <h2 className="font-heading text-lg font-semibold mb-4">Історія</h2>
            <div className="space-y-3">
              {paidPayments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          </section>
        )}

        {payments.length === 0 && (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Немає рахунків</p>
          </Card>
        )}
      </div>
    </div>
  );
}

function PaymentCard({ payment }: { payment: any }) {
  const config = statusConfig[payment.status];
  const StatusIcon = config.icon;

  return (
    <Card data-testid={`payment-card-${payment.id}`}>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-semibold">{formatCurrency(payment.amount)}</p>
            <p className="text-sm text-muted-foreground">{payment.description}</p>
          </div>
          <Badge variant={config.variant}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {config.label}
          </Badge>
        </div>

        {payment.child && (
          <p className="text-sm text-muted-foreground mb-2">
            Учень: {payment.child.firstName} {payment.child.lastName}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {payment.dueDate && `До: ${formatDate(payment.dueDate)}`}
          </span>
          {payment.paidAt && (
            <span>Оплачено: {formatDate(payment.paidAt)}</span>
          )}
        </div>

        {payment.status === 'PENDING' && (
          <Button className="w-full mt-4" data-testid={`pay-btn-${payment.id}`}>
            Оплатити
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
