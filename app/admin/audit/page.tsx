import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Shield, Activity, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

async function getAuditLogs() {
  const logs = await prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return logs;
}

async function getAuditStats() {
  const [totalLogs, todayLogs, criticalActions] = await Promise.all([
    prisma.auditLog.count(),
    prisma.auditLog.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.auditLog.count({
      where: {
        action: {
          in: ['DELETE_ORGANIZATION', 'DELETE_USER', 'PROMOTE_SUPER_ADMIN', 'DELETE_DEADLINE'],
        },
      },
    }),
  ]);

  return { totalLogs, todayLogs, criticalActions };
}

export default async function AdminAuditLogPage() {
  const session = await auth();

  if (!session?.user?.isSuperAdmin) {
    redirect("/auth/login");
  }

  const [logs, stats] = await Promise.all([
    getAuditLogs(),
    getAuditStats(),
  ]);

  const getActionIcon = (action: string) => {
    if (action.startsWith('DELETE')) return <XCircle className="h-4 w-4 text-red-600" />;
    if (action.startsWith('CREATE')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (action.startsWith('UPDATE')) return <Activity className="h-4 w-4 text-blue-600" />;
    return <AlertCircle className="h-4 w-4 text-orange-600" />;
  };

  const getActionColor = (action: string) => {
    if (action.startsWith('DELETE')) return 'bg-red-100 text-red-800';
    if (action.startsWith('CREATE')) return 'bg-green-100 text-green-800';
    if (action.startsWith('UPDATE')) return 'bg-blue-100 text-blue-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Audit Log</h2>
          <p className="text-muted-foreground">
            Registro completo delle azioni critiche nel sistema
          </p>
        </div>
        <Link href="/admin" className="text-sm text-blue-600 hover:underline">
          ← Torna alla dashboard
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale Log</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground mt-1">Tutte le azioni registrate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oggi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayLogs}</div>
            <p className="text-xs text-muted-foreground mt-1">Azioni nelle ultime 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Azioni Critiche</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.criticalActions}</div>
            <p className="text-xs text-muted-foreground mt-1">Eliminazioni e promozioni</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ultimi 100</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Log visualizzati</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Log delle Attività</CardTitle>
          <CardDescription>
            Ultimi 100 eventi registrati nel sistema (ordinati per data decrescente)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Ora</TableHead>
                <TableHead>Azione</TableHead>
                <TableHead>Utente</TableHead>
                <TableHead>Organizzazione</TableHead>
                <TableHead>Dettagli</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nessun log disponibile
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(log.createdAt)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleTimeString('it-IT')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <Link
                          href={`/admin/users/${log.user.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {log.user.name || log.user.email}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sistema</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.organization ? (
                        <Link
                          href={`/admin/organizations/${log.organization.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {log.organization.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.metadata ? (
                        <div className="text-xs text-muted-foreground max-w-md truncate">
                          {typeof log.metadata === 'string'
                            ? log.metadata
                            : JSON.stringify(log.metadata)}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
