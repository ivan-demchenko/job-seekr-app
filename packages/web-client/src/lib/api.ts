import { queryOptions } from "@tanstack/react-query";

import { hc, type InferRequestType } from 'hono/client';
import { type ApiType } from '@job-seekr/api/api.types';

const apiClient = hc<ApiType>('/').api;

export const meQueryOptions = queryOptions({
  queryKey: [`me`],
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
  queryKey: ['applications'],
  queryFn: async () => {
    const res = await apiClient.applications.$get();
    return await res.json();
  },
});

const deleteApplicationEndpoint = apiClient.applications[":id"].$delete;
export async function deleteApplication(
  id: InferRequestType<typeof deleteApplicationEndpoint>['param']['id']
) {
  const res = await deleteApplicationEndpoint({ param: { id } });
  return res.text();
};

const deleteUserApplicationsEndpoint = apiClient.applications["of-user"].$delete;
export async function deleteUserApplications() {
  const res = await deleteUserApplicationsEndpoint();
  return res.text();
};

export const applicationDetailsQueryOptions = (
  id: string
) => queryOptions({
  queryKey: [`application.${id}`],
  queryFn: async () => {
    const res = await apiClient.applications[":id"].$get({ param: { id } })
    return await res.json();
  },
});

const newApplicationEndpoint = apiClient.applications.$post;
export async function saveApplication(
  json: InferRequestType<typeof newApplicationEndpoint>['json']
) {
  const res = await newApplicationEndpoint({ json });
  return res.json();
};

const updateApplicationEndPoint = apiClient.applications[":id"].$put;
export function updateApplication(id: string) {
  return async function (
    json: InferRequestType<typeof updateApplicationEndPoint>['json']
  ) {
    const res = await updateApplicationEndPoint({ json, param: { id } });
    return res.json();
  }
};

export async function addInterview(
  json: InferRequestType<typeof apiClient.interviews.$post>['json']
) {
  const res = await apiClient.interviews.$post({ json });
  return res.json();
};

const updateInterviewEndpoint = apiClient.interviews[":id"].$put;
export async function updateInterview(
  { id, json }: {
    id: string,
    json: InferRequestType<typeof updateInterviewEndpoint>['json']
  }
) {
  const res = await updateInterviewEndpoint({
    json,
    param: { id }
  })
  return res.json();
}