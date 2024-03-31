
import { z } from 'zod';

const UserRoleDtoSchema = z.object({
  role_id: z.number(),
  role_name: z.string(),
  privilege_level: z.number(),
  created_at: z.coerce.date(),  
});

type UserRoleDtoType = z.infer<typeof UserRoleDtoSchema>;

export class UserRoleDto implements UserRoleDtoType {
  constructor(
    public role_id: number,
    public role_name: string,
    public privilege_level: number,
    public created_at: Date,
  ) {}

  static deserialize(rawUserRole: unknown): UserRoleDto {
    let userRoleDto: UserRoleDto;
    userRoleDto = UserRoleDtoSchema.parse(rawUserRole);
    return new UserRoleDto(
      userRoleDto.role_id,
      userRoleDto.role_name,
      userRoleDto.privilege_level,
      userRoleDto.created_at,
    );
  }
}
