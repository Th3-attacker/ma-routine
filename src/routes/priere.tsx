import { useTranslation } from 'react-i18next'

import { ComingSoon } from '@/components/ComingSoon'
import { PageTitle } from '@/components/PageTitle'

export function PrayerPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle>{t('tabs.prayer')}</PageTitle>
      <ComingSoon />
    </>
  )
}
