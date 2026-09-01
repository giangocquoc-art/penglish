import { Box, Table, Tbody, Td, Th, Thead, Tr, type TableProps } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export type AdminColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function AdminTable<T extends { id: string }>({ columns, rows, tableProps }: { columns: AdminColumn<T>[]; rows: T[]; tableProps?: TableProps }) {
  return (
    <Box className="penglish-glass-card" border="1px solid" borderColor="rgba(186,230,253,0.82)" borderRadius="3xl" bg="rgba(255,255,255,0.78)" overflow="hidden" boxShadow="0 14px 34px rgba(31,111,214,0.07)">
      <Box overflowX="auto" sx={{ scrollbarWidth: 'thin' }}>
        <Table size="sm" variant="simple" minW="880px" {...tableProps}>
          <Thead bg="rgba(239,246,255,0.82)">
            <Tr>
              {columns.map((column) => (
                <Th key={column.key} color="#52667A" fontSize="xs" letterSpacing="0.02em" py="4" borderColor="rgba(186,230,253,0.74)">
                  {column.header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {rows.map((row) => (
              <Tr key={row.id} _hover={{ bg: 'rgba(239,246,255,0.54)' }}>
                {columns.map((column) => (
                  <Td key={column.key} py="4" borderColor="rgba(226,242,254,0.92)" color="#16405F" fontWeight="650" verticalAlign="middle">
                    {column.render(row)}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
