import { z } from "zod"

export const JobStatusSchema = z.enum(["queued", "running", "succeeded", "failed", "canceled"])
export type JobStatus = z.infer<typeof JobStatusSchema>

export const JobParamsSchema = z.object({
  identityStrength: z.number().int().min(0).max(100),
})
export type JobParams = z.infer<typeof JobParamsSchema>

export const JobErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
})
export type JobError = z.infer<typeof JobErrorSchema>

export const JobProviderSchema = z.enum(["openrouter", "mock"])
export type JobProvider = z.infer<typeof JobProviderSchema>

export const JobPublicSchema = z.object({
  id: z.string(),
  status: JobStatusSchema,
  stylePackId: z.string(),
  params: JobParamsSchema,
  outputImageUrls: z.array(z.string()),
  error: JobErrorSchema.nullable(),
  attempt: z.number().int().min(1),
  provider: JobProviderSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type JobPublic = z.infer<typeof JobPublicSchema>

export const CreateJobResponseSchema = z.object({
  jobId: z.string(),
})
export type CreateJobResponse = z.infer<typeof CreateJobResponseSchema>

export const GetJobResponseSchema = z.object({
  job: JobPublicSchema,
})
export type GetJobResponse = z.infer<typeof GetJobResponseSchema>

export const ListJobsResponseSchema = z.object({
  jobs: z.array(JobPublicSchema),
  retentionDays: z.number().int().positive(),
})
export type ListJobsResponse = z.infer<typeof ListJobsResponseSchema>

export const DeleteJobResponseSchema = z.object({
  jobId: z.string(),
})
export type DeleteJobResponse = z.infer<typeof DeleteJobResponseSchema>

export const DeleteJobsResponseSchema = z.object({
  deleted: z.number().int().nonnegative(),
})
export type DeleteJobsResponse = z.infer<typeof DeleteJobsResponseSchema>
