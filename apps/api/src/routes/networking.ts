import {
  NetworkingActionCreateSchema,
  NetworkingContactCreateSchema,
  NetworkingActionStatusSchema,
  RelationshipTypeSchema
} from "@careeros/shared";
import { Router } from "express";
import { z } from "zod";
import {
  createNetworkingAction,
  createNetworkingContact,
  listNetworkingActions,
  listNetworkingContacts,
  updateNetworkingAction,
  updateNetworkingContact
} from "../services/application-store";
import type { AuthedRequest } from "../types";

export const networkingRouter = Router();

const IdParamSchema = z.object({
  id: z.string().uuid()
});

const ContactQuerySchema = z.object({
  applicationId: z.string().uuid().optional(),
  relationshipType: RelationshipTypeSchema.optional()
});

const ActionQuerySchema = z.object({
  applicationId: z.string().uuid().optional(),
  contactId: z.string().uuid().optional(),
  status: NetworkingActionStatusSchema.optional()
});

networkingRouter.get("/contacts", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = ContactQuerySchema.parse(req.query);
    res.json(await listNetworkingContacts(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

networkingRouter.post("/contacts", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const contact = NetworkingContactCreateSchema.parse(req.body);
    res.status(201).json(await createNetworkingContact(authedReq.user.id, contact));
  } catch (error) {
    next(error);
  }
});

networkingRouter.patch("/contacts/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const contact = NetworkingContactCreateSchema.parse(req.body);
    res.json(await updateNetworkingContact(authedReq.user.id, id, contact));
  } catch (error) {
    next(error);
  }
});

networkingRouter.get("/actions", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const filters = ActionQuerySchema.parse(req.query);
    res.json(await listNetworkingActions(authedReq.user.id, filters));
  } catch (error) {
    next(error);
  }
});

networkingRouter.post("/actions", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const action = NetworkingActionCreateSchema.parse(req.body);
    res.status(201).json(await createNetworkingAction(authedReq.user.id, action));
  } catch (error) {
    next(error);
  }
});

networkingRouter.patch("/actions/:id", async (req, res, next) => {
  try {
    const authedReq = req as AuthedRequest;
    const { id } = IdParamSchema.parse(req.params);
    const action = NetworkingActionCreateSchema.parse(req.body);
    res.json(await updateNetworkingAction(authedReq.user.id, id, action));
  } catch (error) {
    next(error);
  }
});
