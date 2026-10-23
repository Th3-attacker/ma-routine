import { useTranslation } from 'react-i18next'

import { ComingSoon } from '@/components/ComingSoon'
import { PageTitle } from '@/components/PageTitle'

export function ProjectsPage() {
  const { t } = useTranslation()
  return (
    <>
      <PageTitle>{t('tabs.projects')}</PageTitle>
      <ComingSoon />
    </>
  )
}
