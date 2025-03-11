import {
  interviewComments as tInterviewCommments,
  interviews as tInterviews,
} from "@job-seekr/data/tables";
import { type DBType, and, eq } from "@job-seekr/data/utils";
import type {
  InterviewCommentModel,
  InterviewModel,
  InterviewWithCommentModel,
  NewInterviewCommentModel,
  NewInterviewModel,
} from "@job-seekr/data/validation";
import { Err, Ok, type Result } from "neverthrow";

export class InterviewsRepository {
  constructor(private db: DBType) {}
  async addInterview(
    payload: InterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    try {
      await this.db.insert(tInterviews).values(payload).onConflictDoNothing();
      return new Ok(payload);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add an interview: ${e.message}`);
      }
      return new Err("Failed to add an interview: unknown error");
    }
  }

  async updateInterview(
    interviewId: string,
    payload: NewInterviewModel,
  ): Promise<Result<InterviewModel, string>> {
    try {
      const res = await this.db
        .update(tInterviews)
        .set(payload)
        .where(eq(tInterviews.id, interviewId))
        .returning();
      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add an interview: ${e.message}`);
      }
      return new Err("Failed to add an interview: unknown error");
    }
  }

  async getInterviewById(
    interviewId: string,
  ): Promise<Result<InterviewWithCommentModel, string>> {
    const interviews = await this.db
      .select()
      .from(tInterviews)
      .where(eq(tInterviews.id, interviewId));
    const comments = await this.db
      .select()
      .from(tInterviewCommments)
      .where(eq(tInterviewCommments.interview_id, interviewId));

    if (!interviews) {
      return new Err("Interview not found");
    }

    return new Ok({ ...interviews[0], comments });
  }

  async getInterviews(
    applicationId: string,
  ): Promise<Result<InterviewModel[], string>> {
    try {
      const data = await this.db
        .select()
        .from(tInterviews)
        .where(eq(tInterviews.application_id, applicationId));
      return new Ok(data);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to read from the interviews table: ${e.message}`,
        );
      }
      return new Err("Failed to read from the interviews table: unknown error");
    }
  }

  async getAllInterviews(): Promise<Result<InterviewModel[], string>> {
    try {
      const rawData = await this.db.select().from(tInterviews);
      return new Ok(rawData);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(
          `Failed to read from the interviews table: ${e.message}`,
        );
      }
      return new Err("Failed to read from the interviews table: unknown error");
    }
  }

  async addNewComment(
    payload: Omit<InterviewCommentModel, "pinned">,
  ): Promise<Result<InterviewCommentModel, string>> {
    try {
      const newComment = await this.db
        .insert(tInterviewCommments)
        .values(payload)
        .onConflictDoNothing()
        .returning();
      return new Ok(newComment[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to add comment: ${e.message}`);
      }
      return new Err("Failed to add comment: unknown error");
    }
  }

  async deleteComment(
    interveiwId: string,
    commentId: string,
  ): Promise<Result<boolean, string>> {
    try {
      await this.db
        .delete(tInterviewCommments)
        .where(
          and(
            eq(tInterviewCommments.id, commentId),
            eq(tInterviewCommments.interview_id, interveiwId),
          ),
        );
      return new Ok(true);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to delete comment: ${e.message}`);
      }
      return new Err("Failed to delete comment: unknown error");
    }
  }

  async updateComment(
    commentId: string,
    payload: Omit<NewInterviewCommentModel, "comment_date">,
  ): Promise<Result<InterviewCommentModel, string>> {
    try {
      const res = await this.db
        .update(tInterviewCommments)
        .set(payload)
        .where(eq(tInterviewCommments.id, commentId))
        .returning();
      return new Ok(res[0]);
    } catch (e) {
      if (e instanceof Error) {
        return new Err(`Failed to update comment: ${e.message}`);
      }
      return new Err("Failed to udpate comment: unknown error");
    }
  }
}
