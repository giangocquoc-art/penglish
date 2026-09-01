import { Box, Flex } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { OceanPageShell } from '../../components/p-english/OceanPageShell';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout({ title, description, email, children }: { title: string; description: string; email?: string; children: ReactNode }) {
  return (
    <OceanPageShell variant="dashboard" overlayStrength="medium" glassIntensity="clear" showAmbientPooWhale={false} minH="100vh" px={{ base: '3', md: '5', xl: '7' }} py={{ base: '3', md: '5' }}>
      <Flex maxW="1480px" mx="auto" gap={{ base: '3', lg: '5' }} direction={{ base: 'column', lg: 'row' }} align="stretch">
        <AdminSidebar />
        <Box flex="1" minW="0">
          <AdminHeader title={title} description={description} email={email} />
          <Box mt={{ base: '3', md: '5' }}>{children}</Box>
        </Box>
      </Flex>
    </OceanPageShell>
  );
}
