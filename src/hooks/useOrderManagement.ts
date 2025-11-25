import { supabase } from '../lib/supabase';
import { BaseEntity } from './useEntityManager';

export type OrderConfig<T extends BaseEntity> = {
    rpcFunctionName: string;
    idParam1Name: string;
    idParam2Name: string;
    entities: T[];
    onError: (error: string) => void;
    onReload: () => void;
};

export function useOrderManagement<T extends BaseEntity>(config: OrderConfig<T>) {
    const handleMove = async (id: string, direction: 'up' | 'down') => {
        config.onError('');
        const index = config.entities.findIndex(e => e.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === config.entities.length - 1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        const entity1 = config.entities[index];
        const entity2 = config.entities[swapIndex];

        try {
            // Use atomic RPC function to swap order indices
            const { error } = await supabase.rpc(config.rpcFunctionName, {
                [config.idParam1Name]: entity1.id,
                [config.idParam2Name]: entity2.id,
            });

            if (error) {
                config.onError(`Nie udało się przesunąć elementu: ${error.message}`);
                return;
            }

            // Reload entities to reflect the change
            config.onReload();
        } catch (err: unknown) {
            config.onError(`Wystąpił błąd podczas przesuwania: ${err instanceof Error ? err.message : 'Nieznany błąd'}`);
            config.onReload(); // Reload to ensure UI is in sync with database
        }
    };

    return {
        handleMove,
    };
}
