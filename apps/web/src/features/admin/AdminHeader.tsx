import { Avatar, Box, Button, Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export function AdminHeader({ title, description, email }: { title: string; description: string; email?: string }) {
  return (
    <Flex className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" bg="rgba(255,255,255,0.74)" p={{ base: '4', md: '5' }} align={{ base: 'stretch', md: 'center' }} justify="space-between" gap="4" direction={{ base: 'column', md: 'row' }}>
      <Box minW="0">
        <Text color="#0F3557" fontSize={{ base: '2xl', md: '3xl' }} fontWeight="900" letterSpacing="-0.045em">{title}</Text>
        <Text color="#52667A" fontWeight="650" mt="1">{description}</Text>
      </Box>
      <HStack gap="3" justify={{ base: 'space-between', md: 'flex-end' }}>
        <Button as={RouterLink} to="/home" variant="outline" borderColor="#BAE6FD" color="#0369A1" bg="rgba(255,255,255,0.68)" borderRadius="2xl" _hover={{ bg: '#EFF6FF' }}>
          Về trang học
        </Button>
        <HStack border="1px solid" borderColor="#BAE6FD" bg="rgba(239,246,255,0.74)" borderRadius="2xl" px="3" py="2" minW="0">
          <Avatar size="sm" name={email ?? 'Admin'} bg="#0EA5E9" color="white" />
          <VStack display={{ base: 'none', sm: 'flex' }} align="start" gap="0" minW="0">
            <Text color="#0F3557" fontSize="sm" fontWeight="850">Admin</Text>
            <Text color="#52667A" fontSize="xs" fontWeight="700" maxW="210px" noOfLines={1}>{email}</Text>
          </VStack>
        </HStack>
      </HStack>
    </Flex>
  );
}
