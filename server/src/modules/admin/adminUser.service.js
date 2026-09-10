import { toAdminUser } from './adminUser.presenter.js';
import { listAdminUsers } from './adminUser.repository.js';

export async function getAdminUsers(filters, { listUsers = listAdminUsers } = {}) {
  const { users, total } = await listUsers(filters);
  return {
    items: users.map(toAdminUser),
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.ceil(total / filters.pageSize),
    },
  };
}
