
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export function FormsListSkeleton() {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-9 w-48 mb-2" />
                    <Skeleton className="h-5 w-64" />
                </div>
                <Skeleton className="h-9 w-32" />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-40" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-20 ml-auto" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-32" /></TableHead>
                            <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                            <TableHead className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="font-medium">
                                    <Skeleton className="h-4 w-48" />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-4 w-32" />
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Skeleton className="h-4 w-8 ml-auto" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-4 w-24" />
                                </TableCell>
                                <TableCell>
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
