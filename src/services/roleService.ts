import { fetchClient } from '../shares/fetchClient';

export interface Role {
  roleId: string;
  roleName: string;
  description: string;
}

export const getRoles = async () => {
  const res = await fetchClient('/roles');
  return res.data || [];
};
