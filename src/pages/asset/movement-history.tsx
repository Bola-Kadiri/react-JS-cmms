import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const MovementHistory = () => {
  const { t } = useTypedTranslation('assets');
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">{t('movement.title')}</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <p>{t('movement.placeholder')}</p>
      </div>
    </div>
  );
};

export default MovementHistory;
