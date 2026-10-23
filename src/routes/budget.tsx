import { useTranslation } from 'react-i18next'

import { ComingSoon } from '@/components/ComingSoon'
import { PageTitle } from '@/components/PageTitle'

export function BudgetPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle>{t('tabs.budget')}</PageTitle>
      <ComingSoon />
    </>
  )
}
