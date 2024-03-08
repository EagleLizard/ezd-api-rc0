
import { z } from 'zod';

const PasswordDtoSchema = z.object({
  password_id: z.string(),
  password_hash: z.string(),
  salt: z.string(),
  user_id: z.string(),
  created_at: z.coerce.date(),
});

type PasswordDtoType = z.infer<typeof PasswordDtoSchema>;

export class PasswordDto implements PasswordDtoType {
  constructor(
    public password_id: string,
    public password_hash: string,
    public salt: string,
    public user_id: string,
    public created_at: Date,
  ) {}

  static deserialize(rawPassword: unknown): PasswordDto {
    let passwordDto: PasswordDto;
    passwordDto = PasswordDtoSchema.parse(rawPassword);
    return new PasswordDto(
      passwordDto.password_id,
      passwordDto.password_hash,
      passwordDto.salt,
      passwordDto.user_id,
      passwordDto.created_at,
    );
  }
}
