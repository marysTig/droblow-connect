-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Affiliates can view their own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = affiliate_id);

CREATE POLICY "Affiliates can update their own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = affiliate_id);

CREATE POLICY "Admins can view all notifications"
    ON public.notifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can insert notifications"
    ON public.notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can update notifications"
    ON public.notifications FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE id = auth.uid()
        )
    );
    
CREATE POLICY "Admins can delete notifications"
    ON public.notifications FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.admins
            WHERE id = auth.uid()
        )
    );

-- Trigger Function: notify_product_launch
CREATE OR REPLACE FUNCTION notify_product_launch()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (affiliate_id, type, title, message, link)
    SELECT id, 'product_launch', 'Nouveau produit lancé', 'Le produit ' || NEW.name || ' est maintenant disponible.', '/dashboard/products'
    FROM public.affiliates;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_product_launch ON public.products;
CREATE TRIGGER on_product_launch
    AFTER INSERT ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION notify_product_launch();


-- Trigger Function: notify_withdrawal_update
CREATE OR REPLACE FUNCTION notify_withdrawal_update()
RETURNS trigger AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (affiliate_id, type, title, message, link)
        VALUES (
            NEW.affiliate_id, 
            'withdrawal_update', 
            'Mise à jour du retrait', 
            'Votre demande de retrait est maintenant: ' || NEW.status, 
            '/dashboard/profile'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_withdrawal_update ON public.withdrawals;
CREATE TRIGGER on_withdrawal_update
    AFTER UPDATE ON public.withdrawals
    FOR EACH ROW
    EXECUTE FUNCTION notify_withdrawal_update();


-- Trigger Function: notify_order_update
CREATE OR REPLACE FUNCTION notify_order_update()
RETURNS trigger AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.affiliate_id IS NOT NULL THEN
        -- Order update notification
        INSERT INTO public.notifications (affiliate_id, type, title, message, link)
        VALUES (
            NEW.affiliate_id, 
            'order_update', 
            'Mise à jour de commande', 
            'La commande de ' || NEW.customer_name || ' est passée à: ' || NEW.status, 
            '/dashboard/orders'
        );

        -- If commission is unlocked (status = delivered)
        IF NEW.status = 'delivered' THEN
            INSERT INTO public.notifications (affiliate_id, type, title, message, link)
            VALUES (
                NEW.affiliate_id, 
                'commission_unlocked', 
                'Commission débloquée', 
                'Vous avez gagné ' || NEW.commission || ' DZD pour la commande de ' || NEW.customer_name, 
                '/dashboard/profile'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_order_update ON public.orders;
CREATE TRIGGER on_order_update
    AFTER UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_order_update();
