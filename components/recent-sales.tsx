import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Sale {
  name: string;
  email: string;
  amount: string;
}

interface RecentSalesProps {
  data: Sale[];
}

export function RecentSales({ data }: RecentSalesProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((sale, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium">{sale.name}</TableCell>
            <TableCell>{sale.email}</TableCell>
            <TableCell className="text-right">{sale.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
