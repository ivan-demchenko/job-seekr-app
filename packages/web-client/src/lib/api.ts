import { queryOptions } from "@tanstack/react-query";

import type { ApiType } from "@job-seekr/api/api.types";
import { type InferRequestType, hc } from "hono/client";

const apiClient = hc<ApiType>("/").api;

export const meQueryOptions = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    const res = await apiClient.auth.me.$get();
    if (!res.ok) {
      if (res.status === 401) {
        return { error: 401 };
      }
    }
    return await res.json();
  },
});

export const applicationsListQueryOptions = queryOptions({
  queryKey: ["applications"],
  queryFn: async () => {
    const res = await apiClient.applications.$get();
    return await res.json();
  },
});

const deleteApplicationEndpoint = apiClient.applications[":id"].$delete;
export async function deleteApplication(
  id: InferRequestType<typeof deleteApplicationEndpoint>["param"]["id"],
) {
  const res = await deleteApplicationEndpoint({ param: { id } });
  return res.text();
}

const deleteUserApplicationsEndpoint =
  apiClient.applications["of-user"].$delete;
export async function deleteUserApplications() {
  const res = await deleteUserApplicationsEndpoint();
  return res.text();
}

export const applicationDetailsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [`application.${id}`],
    queryFn: async () => {
      const res = await apiClient.applications[":id"].$get({
        param: { id },
      });
      return await res.json();
    },
  });

const newApplicationEndpoint = apiClient.applications.$post;
export async function saveApplication(
  json: InferRequestType<typeof newApplicationEndpoint>["json"],
) {
  const res = await newApplicationEndpoint({ json });
  return res.json();
}

const updateApplicationEndPoint = apiClient.applications[":id"].$put;
export function updateApplication(id: string) {
  return async (
    json: InferRequestType<typeof updateApplicationEndPoint>["json"],
  ) => {
    const res = await updateApplicationEndPoint({ json, param: { id } });
    return res.json();
  };
}

export async function addInterview(
  json: InferRequestType<typeof apiClient.interviews.$post>["json"],
) {
  const res = await apiClient.interviews.$post({ json });
  return res.json();
}

const updateInterviewEndpoint = apiClient.interviews[":id"].$put;
export async function updateInterview({
  id,
  json,
}: {
  id: string;
  json: InferRequestType<typeof updateInterviewEndpoint>["json"];
}) {
  const res = await updateInterviewEndpoint({
    json,
    param: { id },
  });
  return res.json();
}

export const interviewDetailsQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [`interview.${id}`],
    queryFn: async () => {
      const res = await apiClient.interviews[":id"].$get({ param: { id } });
      return await res.json();
    },
  });

const addInterviewCommentEndpoint = apiClient.interviews[":id"].comments.$post;
export async function addInterviewComment({
  id,
  json,
}: {
  id: string;
  json: InferRequestType<typeof addInterviewCommentEndpoint>["json"];
}) {
  const res = await addInterviewCommentEndpoint({ json, param: { id } });
  return res.json();
}

const deleteInterviewCommentEndpoint =
  apiClient.interviews[":id"].comments[":comment_id"].$delete;
export async function deleteInterviewComment({
  interviewId,
  commentId,
}: { interviewId: string; commentId: string }) {
  const res = await deleteInterviewCommentEndpoint({
    param: { id: interviewId, comment_id: commentId },
  });
  return res.json();
}

const updateInterviewCommentEndpoint =
  apiClient.interviews[":id"].comments[":comment_id"].$put;
export async function updateInterviewComment({
  id,
  json,
}: {
  id: string;
  json: InferRequestType<typeof updateInterviewCommentEndpoint>["json"];
}) {
  const res = await updateInterviewCommentEndpoint({
    json,
    param: { comment_id: id },
  });
  return res.json();
}
