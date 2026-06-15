import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/student/fees")({
  component: FeesPage,
});

type Voucher = {
  voucher_id: number;
  total_amount: number;
  issue_date: string | null;
  due_date: string;
  status: string | null;
};

function FeesPage() {
  const { student } = useAuth();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!student) return;
    setLoading(true);
    const { data } = await supabase
      .from("fee_vouchers")
      .select("voucher_id, total_amount, issue_date, due_date, status")
      .eq("student_id", student.student_id)
      .order("issue_date", { ascending: false });
    setVouchers((data as Voucher[]) ?? []);
    setLoading(false);
  }, [student]);

  useEffect(() => { load(); }, [load]);

  const pay = async (v: Voucher) => {
    setPaying(v.voucher_id);
    const { error: payErr } = await supabase.from("payments").insert({
      voucher_id: v.voucher_id,
      amount_paid: v.total_amount,
      payment_method: "Card (Mock)",
    });
    if (payErr) { toast.error(payErr.message); setPaying(null); return; }
    const { error: updErr } = await supabase
      .from("fee_vouchers").update({ status: "Paid" }).eq("voucher_id", v.voucher_id);
    if (updErr) toast.error(updErr.message); else toast.success("Payment successful");
    setPaying(null); load();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fee Vouchers</h1>
        <p className="text-muted-foreground mt-1">Pay tuition based on your enrolled credits.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Vouchers</CardTitle></CardHeader>
        <CardContent>
          {vouchers.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">No vouchers yet. Register for courses to generate one.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Voucher #</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchers.map((v) => (
                  <TableRow key={v.voucher_id}>
                    <TableCell className="font-medium">#{v.voucher_id}</TableCell>
                    <TableCell>{v.issue_date ?? "—"}</TableCell>
                    <TableCell>{v.due_date}</TableCell>
                    <TableCell>Rs. {Number(v.total_amount).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={v.status === "Paid" ? "secondary" : "destructive"}>{v.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {v.status === "Paid" ? (
                        <span className="text-xs text-muted-foreground">Paid</span>
                      ) : (
                        <Button size="sm" onClick={() => pay(v)} disabled={paying === v.voucher_id}>
                          {paying === v.voucher_id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}