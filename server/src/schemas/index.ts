import { z } from 'zod';

const passwordRule = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_\-+=.]{6,32}$/;

export const registerSchema = z.object({
  username: z
    .string()
    .regex(/^[A-Za-z0-9_]{3,20}$/, '用户名需为 3-20 位字母、数字或下划线'),
  email: z.string().trim().email('邮箱格式不正确').max(100, '邮箱不能超过 100 个字符'),
  password: z.string().regex(passwordRule, '密码需 6-32 位且同时包含字母和数字'),
});

export const loginSchema = z.object({
  account: z.string().trim().min(1, '请输入邮箱或用户名').max(100, '账号长度超出限制'),
  password: z.string().min(1, '请输入密码').max(32, '密码长度超出限制'),
});

const optionalUrl = z
  .union([z.string().trim().url('请输入合法的图片 URL'), z.literal(''), z.null()])
  .optional()
  .transform((value) => (value === '' || value === undefined ? null : value));

export const updateProfileSchema = z.object({
  avatarUrl: optionalUrl,
  bio: z
    .union([z.string().max(200, '个人简介不能超过 200 个字符'), z.null()])
    .optional()
    .transform((value) => (value === undefined || value === null ? null : value.trim())),
});

const tagSchema = z
  .string()
  .trim()
  .min(1, '标签不能为空')
  .max(30, '单个标签不能超过 30 个字符');

const coverUrl = z
  .union([z.string().trim().url('封面需为合法的图片 URL'), z.literal(''), z.null()])
  .optional()
  .transform((value) => (value === '' || value === undefined ? null : value));

export const articlePayloadSchema = z.object({
  title: z.string().trim().min(1, '请输入标题').max(100, '标题不能超过 100 个字符'),
  content: z.string().min(1, '请输入正文').max(200000, '正文过长'),
  categoryId: z.coerce.number().int('分类不合法').positive('请选择分类'),
  tags: z.array(tagSchema).max(5, '标签最多 5 个').optional().default([]),
  coverUrl,
});

export const articleListQuerySchema = z.object({
  page: z.coerce.number().int('页码不合法').min(1, '页码最小为 1').optional().default(1),
  pageSize: z.coerce
    .number()
    .int('每页数量不合法')
    .min(1, '每页数量最小为 1')
    .max(50, '每页数量最大为 50')
    .optional()
    .default(10),
  categoryId: z.coerce.number().int().positive().optional(),
  authorId: z.coerce.number().int().positive().optional(),
  keyword: z.string().trim().max(100, '关键词过长').optional(),
});
