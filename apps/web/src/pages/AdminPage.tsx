import { Box, Button, Center, Checkbox, Flex, FormControl, FormLabel, HStack, Icon, Input, Progress, SimpleGrid, Text, Textarea, VStack } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { Activity, BookCheck, MessageSquareWarning, Plus, Upload, UserPlus, Users } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { AdminLayout } from '../features/admin/AdminLayout';
import { AdminTable, type AdminColumn } from '../features/admin/AdminTable';
import { StatCard } from '../features/admin/StatCard';
import { StatusBadge } from '../features/admin/StatusBadge';
import { adminFeedback, adminLessons, adminStats, adminUsers, adminWords, popularLessons, type AdminFeedback, type AdminLesson, type AdminUser, type AdminWord } from '../features/admin/adminMockData';

const ADMIN_EMAIL = 'giangocquoc@gmail.com';

type AdminSection = 'overview' | 'users' | 'lessons' | 'words' | 'feedback' | 'settings';

const sectionMeta: Record<AdminSection, { title: string; description: string }> = {
  overview: { title: 'Tổng quan quản trị', description: 'Theo dõi sức khỏe học tập, nội dung và phản hồi của PooEnglish.' },
  users: { title: 'Người học', description: 'Quản lý tài khoản, tiến độ học và trạng thái truy cập.' },
  lessons: { title: 'Bài học', description: 'Chuẩn bị cấu trúc quản lý bài học để nối Supabase sau này.' },
  words: { title: 'Từ vựng', description: 'Quản lý kho từ, ví dụ, chủ đề và độ khó.' },
  feedback: { title: 'Phản hồi', description: 'Theo dõi góp ý, lỗi giao diện và yêu cầu hỗ trợ từ người học.' },
  settings: { title: 'Cài đặt website', description: 'Thiết lập thông tin hiển thị và các công tắc vận hành chính.' },
};

export function AdminPage() {
  const auth = useAuth();
  const location = useLocation();
  const section = getAdminSection(location.pathname);

  if (auth.loading) {
    return (
      <Center minH="100vh" bg="linear-gradient(135deg, #E0F2FE, #FFFFFF)">
        <VStack className="penglish-glass-card" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" bg="rgba(255,255,255,0.82)" p="8" gap="3">
          <Text color="#0F3557" fontWeight="900" fontSize="xl">Đang kiểm tra quyền quản trị</Text>
          <Text color="#52667A" fontWeight="650">PooEnglish đang xác minh tài khoản admin.</Text>
        </VStack>
      </Center>
    );
  }

  if (!auth.isAuthenticated) {
    const requestedPath = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(requestedPath)}`} replace />;
  }

  if ((auth.user?.email ?? '').toLowerCase() !== ADMIN_EMAIL) {
    return (
      <Center minH="100vh" px="4" bg="linear-gradient(135deg, #E0F2FE, #FFFFFF)">
        <VStack className="penglish-glass-card" border="1px solid" borderColor="#BAE6FD" borderRadius="3xl" bg="rgba(255,255,255,0.86)" p={{ base: '6', md: '9' }} maxW="560px" textAlign="center" gap="4">
          <Text color="#0F3557" fontWeight="900" fontSize={{ base: '2xl', md: '3xl' }}>Bạn không có quyền vào trang admin</Text>
          <Text color="#52667A" fontWeight="650">Khu vực này chỉ dành cho tài khoản quản trị PooEnglish đã được cấp quyền.</Text>
          <Button as="a" href="/login" bg="#0EA5E9" color="white" borderRadius="2xl" _hover={{ bg: '#0284C7' }}>Đăng nhập bằng tài khoản admin</Button>
        </VStack>
      </Center>
    );
  }

  const meta = sectionMeta[section];

  return (
    <AdminLayout title={meta.title} description={meta.description} email={auth.user?.email ?? undefined}>
      {section === 'overview' ? <OverviewSection /> : null}
      {section === 'users' ? <UsersSection /> : null}
      {section === 'lessons' ? <LessonsSection /> : null}
      {section === 'words' ? <WordsSection /> : null}
      {section === 'feedback' ? <FeedbackSection /> : null}
      {section === 'settings' ? <SettingsSection /> : null}
    </AdminLayout>
  );
}

function OverviewSection() {
  const icons = [Users, UserPlus, BookCheck, MessageSquareWarning];
  return (
    <VStack align="stretch" gap="5">
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
        {adminStats.map((stat, index) => <StatCard key={stat.label} {...stat} icon={icons[index]} />)}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="5" alignItems="start">
        <SectionCard title="Người học mới nhất" helper="Dữ liệu mẫu, sẵn sàng thay bằng truy vấn Supabase.">
          <AdminTable columns={latestUserColumns} rows={adminUsers.slice(0, 4)} tableProps={{ minW: '680px' }} />
        </SectionCard>
        <SectionCard title="Bài học phổ biến" helper="Theo dõi lượng học và tỷ lệ hoàn thành.">
          <VStack align="stretch" gap="3">
            {popularLessons.map((lesson) => (
              <Box key={lesson.id} border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="2xl" bg="rgba(255,255,255,0.78)" p="4">
                <Flex justify="space-between" align="start" gap="3" mb="3">
                  <Box minW="0">
                    <Text color="#0F3557" fontWeight="900">{lesson.title}</Text>
                    <Text color="#52667A" fontSize="sm" fontWeight="700">{lesson.learners} người học</Text>
                  </Box>
                  <StatusBadge status={lesson.completion} tone="blue" />
                </Flex>
                <Progress value={Number.parseInt(lesson.completion, 10)} colorScheme="blue" borderRadius="full" bg="#E0F2FE" />
              </Box>
            ))}
          </VStack>
        </SectionCard>
      </SimpleGrid>
      <SectionCard title="Phản hồi mới" helper="Các phản hồi cần ưu tiên xử lý trong ngày.">
        <AdminTable columns={feedbackColumns.slice(0, 5)} rows={adminFeedback.slice(0, 3)} tableProps={{ minW: '760px' }} />
      </SectionCard>
    </VStack>
  );
}

function UsersSection() {
  return <AdminTable columns={userColumns} rows={adminUsers} />;
}

function LessonsSection() {
  return (
    <VStack align="stretch" gap="4">
      <Toolbar actions={[{ label: 'Thêm bài học', icon: Plus }]} />
      <AdminTable columns={lessonColumns} rows={adminLessons} />
    </VStack>
  );
}

function WordsSection() {
  return (
    <VStack align="stretch" gap="4">
      <Toolbar actions={[{ label: 'Thêm từ', icon: Plus }, { label: 'Import CSV', icon: Upload }]} />
      <AdminTable columns={wordColumns} rows={adminWords} />
    </VStack>
  );
}

function FeedbackSection() {
  return <AdminTable columns={feedbackColumns} rows={adminFeedback} />;
}

function SettingsSection() {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" bg="rgba(255,255,255,0.78)" p={{ base: '4', md: '6' }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <AdminField label="Tên website" value="PooEnglish" />
        <AdminField label="Logo URL" value="https://pooenglish.com/logo.png" />
        <AdminSwitch label="Bật Google Login" checked />
        <AdminSwitch label="Bật chế độ bảo trì" />
        <AdminField label="Link Threads" value="https://www.threads.net/@pooenglish" />
        <AdminField label="Link Facebook" value="https://facebook.com/pooenglish" />
        <FormControl gridColumn={{ base: 'auto', lg: 'span 2' }}>
          <FormLabel color="#0F3557" fontWeight="850">Thông báo đầu trang</FormLabel>
          <Textarea defaultValue="Học đều 15 phút mỗi ngày để giữ chuỗi ngày học." borderColor="#BAE6FD" bg="rgba(255,255,255,0.78)" borderRadius="2xl" minH="110px" />
        </FormControl>
        <AdminField label="CTA chính" value="Bắt đầu bài hôm nay" />
      </SimpleGrid>
      <HStack mt="6" justify="flex-end">
        <Button bg="#0EA5E9" color="white" borderRadius="2xl" _hover={{ bg: '#0284C7' }}>Lưu cài đặt mẫu</Button>
      </HStack>
    </Box>
  );
}

function SectionCard({ title, helper, children }: { title: string; helper: string; children: ReactNode }) {
  return (
    <Box minW="0">
      <HStack mb="3" justify="space-between" align="end" gap="3">
        <Box minW="0">
          <Text color="#0F3557" fontWeight="900" fontSize="xl">{title}</Text>
          <Text color="#52667A" fontSize="sm" fontWeight="650">{helper}</Text>
        </Box>
      </HStack>
      {children}
    </Box>
  );
}

function Toolbar({ actions }: { actions: { label: string; icon: typeof Plus }[] }) {
  return (
    <Flex justify="flex-end" gap="2.5" wrap="wrap">
      {actions.map((action) => (
        <Button key={action.label} leftIcon={<Icon as={action.icon} boxSize="4" />} bg="#0EA5E9" color="white" borderRadius="2xl" _hover={{ bg: '#0284C7' }}>
          {action.label}
        </Button>
      ))}
    </Flex>
  );
}

function AdminField({ label, value }: { label: string; value: string }) {
  return (
    <FormControl>
      <FormLabel color="#0F3557" fontWeight="850">{label}</FormLabel>
      <Input defaultValue={value} borderColor="#BAE6FD" bg="rgba(255,255,255,0.78)" borderRadius="2xl" fontWeight="650" />
    </FormControl>
  );
}

function AdminSwitch({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <FormControl border="1px solid" borderColor="#BAE6FD" bg="rgba(239,246,255,0.58)" borderRadius="2xl" p="4">
      <Checkbox defaultChecked={checked} colorScheme="blue" fontWeight="850" color="#0F3557">{label}</Checkbox>
    </FormControl>
  );
}

const actionButtonProps = { size: 'xs' as const, variant: 'outline' as const, borderColor: '#BAE6FD', color: '#0369A1', borderRadius: 'full' };

const latestUserColumns: AdminColumn<AdminUser>[] = [
  { key: 'name', header: 'Tên', render: (row) => row.name },
  { key: 'email', header: 'Email', render: (row) => row.email },
  { key: 'currentLesson', header: 'Bài đang học', render: (row) => row.currentLesson },
  { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
];

const userColumns: AdminColumn<AdminUser>[] = [
  { key: 'name', header: 'Tên', render: (row) => row.name },
  { key: 'email', header: 'Email', render: (row) => row.email },
  { key: 'joinedAt', header: 'Ngày đăng ký', render: (row) => row.joinedAt },
  { key: 'lastLogin', header: 'Lần đăng nhập cuối', render: (row) => row.lastLogin },
  { key: 'currentLesson', header: 'Bài đang học', render: (row) => row.currentLesson },
  { key: 'progress', header: 'Tiến độ', render: (row) => <HStack minW="130px"><Progress flex="1" value={row.progress} borderRadius="full" colorScheme="blue" /><Text fontSize="xs" fontWeight="850">{row.progress}%</Text></HStack> },
  { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'actions', header: 'Hành động', render: (row) => <HStack gap="1.5" wrap="wrap"><Button {...actionButtonProps}>Xem chi tiết</Button><Button {...actionButtonProps}>{row.status === 'Tạm khóa' ? 'Mở khóa' : 'Khóa'}</Button><Button {...actionButtonProps}>Reset tiến độ</Button></HStack> },
];

const lessonColumns: AdminColumn<AdminLesson>[] = [
  { key: 'title', header: 'Bài', render: (row) => row.title },
  { key: 'topic', header: 'Chủ đề', render: (row) => row.topic },
  { key: 'wordCount', header: 'Số từ vựng', render: (row) => row.wordCount },
  { key: 'listeningCount', header: 'Số câu nghe', render: (row) => row.listeningCount },
  { key: 'quizCount', header: 'Số quiz', render: (row) => row.quizCount },
  { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'actions', header: 'Hành động', render: (row) => <HStack gap="1.5" wrap="wrap"><Button {...actionButtonProps}>Sửa</Button><Button {...actionButtonProps}>{row.status === 'Đang ẩn' ? 'Hiện' : 'Ẩn'}</Button><Button {...actionButtonProps}>Xem trước</Button></HStack> },
];

const wordColumns: AdminColumn<AdminWord>[] = [
  { key: 'english', header: 'Từ tiếng Anh', render: (row) => row.english },
  { key: 'vietnamese', header: 'Nghĩa tiếng Việt', render: (row) => row.vietnamese },
  { key: 'example', header: 'Ví dụ', render: (row) => <Text maxW="260px" noOfLines={2}>{row.example}</Text> },
  { key: 'topic', header: 'Chủ đề', render: (row) => row.topic },
  { key: 'difficulty', header: 'Độ khó', render: (row) => <StatusBadge status={row.difficulty} tone="blue" /> },
  { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
  { key: 'actions', header: 'Hành động', render: () => <HStack gap="1.5" wrap="wrap"><Button {...actionButtonProps}>Sửa</Button><Button {...actionButtonProps} color="#B91C1C">Xóa</Button></HStack> },
];

const feedbackColumns: AdminColumn<AdminFeedback>[] = [
  { key: 'sender', header: 'Người gửi', render: (row) => row.sender },
  { key: 'email', header: 'Email', render: (row) => row.email },
  { key: 'content', header: 'Nội dung', render: (row) => <Text maxW="320px" noOfLines={2}>{row.content}</Text> },
  { key: 'page', header: 'Trang gặp lỗi', render: (row) => <Text maxW="240px" noOfLines={1}>{row.page}</Text> },
  { key: 'createdAt', header: 'Thời gian', render: (row) => row.createdAt },
  { key: 'status', header: 'Trạng thái', render: (row) => <StatusBadge status={row.status} /> },
];

function getAdminSection(pathname: string): AdminSection {
  if (pathname === '/admin/users') return 'users';
  if (pathname === '/admin/lessons') return 'lessons';
  if (pathname === '/admin/words') return 'words';
  if (pathname === '/admin/feedback') return 'feedback';
  if (pathname === '/admin/settings') return 'settings';
  return 'overview';
}
