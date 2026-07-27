import React from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Check, Package, Wallet, Banknote, ShoppingBag } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/lib/queries";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationsPopover() {
  const { session } = useAuth();
  const affiliateId = session?.user.id;
  
  const { data: notifications = [] } = useNotifications(affiliateId);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "product_launch":
        return <Package className="h-4 w-4 text-brand" />;
      case "withdrawal_update":
        return <Wallet className="h-4 w-4 text-blue-500" />;
      case "commission_unlocked":
        return <Banknote className="h-4 w-4 text-green-500" />;
      case "order_update":
        return <ShoppingBag className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto p-1"
              onClick={() => affiliateId && markAllRead.mutate(affiliateId)}
              disabled={markAllRead.isPending}
            >
              <Check className="mr-1 h-3 w-3" />
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors border-b last:border-0 ${
                    !notification.is_read ? "bg-muted/30" : ""
                  }`}
                  onClick={() => {
                    if (!notification.is_read) {
                      markRead.mutate(notification.id);
                    }
                  }}
                >
                  <div className="mt-1 flex-shrink-0 bg-background p-2 rounded-full border shadow-sm">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm font-medium leading-none ${!notification.is_read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: fr })}
                      </p>
                      {notification.link && (
                        <Link
                          to={notification.link as any}
                          className="text-[10px] font-medium text-brand hover:underline"
                        >
                          Voir
                        </Link>
                      )}
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
