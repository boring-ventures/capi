import {
  boolean,
  decimal,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// Enums
export const serviceStatusEnum = pgEnum("service_status", [
  "created",
  "in_progress",
  "completed",
  "canceled",
  "disputed",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "rejected",
  "approved",
  "accepted",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
]);

export const userRoleEnum = pgEnum("user_role", [
  "client",
  "technician",
]);

export const workStatusEnum = pgEnum("work_status", [
  "pending",
  "on_way",
  "working",
  "payment",
  "completed",
]);

export const disputeStatusEnum = pgEnum("dispute_status", [
  "pending",
  "in_review",
  "resolved",
  "rejected",
]);

export const offerStatusEnum = pgEnum("offer_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
  "cancelled",
]);

export const notificationStatusEnum = pgEnum("notification_status", [
  "unread",
  "read",
  "offered",
  "rejected",
]);

export const paymentMethodEnum = pgEnum("payment_method", ["", "cash", "qr"]);

export const systemVariableCategoryEnum = pgEnum("system_variable_category", [
  "version",
  "config",
  "images",
  "contact",
  "location",
]);

// Enum para tipo de descuento (porcentaje o monto fijo)
export const discountTypeEnum = pgEnum("discount_type", [
  "percentage",
  "fixed",
]);

// Tabla de Usuarios
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: userRoleEnum("role").notNull(),
  status: userStatusEnum("status").notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  fechaNacimiento: timestamp("fechaNacimiento"),
  password: varchar("password", { length: 255 }).notNull(),
  first_discount_claimed: boolean("first_discount_claimed").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  reviewStatus: reviewStatusEnum("reviewStatus").notNull().default("pending"),
});

// Tabla de Ubicaciones
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  reference: varchar("reference", { length: 255 }),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Servicios
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: serviceStatusEnum("status").notNull().default("created"),
  work_status: workStatusEnum("work_status").notNull().default("pending"),
  payment_completed: boolean("payment_completed").default(false),
  payment_method: paymentMethodEnum("payment_method"),
  payment_completed_at: timestamp("payment_completed_at"),
  last_status_update: timestamp("last_status_update").defaultNow(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  subcategory_id: uuid("subcategory_id").references(() => subcategories.id, {
    onDelete: "cascade",
  }),
  client_id: uuid("client_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  technician_id: uuid("technician_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  location_id: uuid("location_id")
    .notNull()
    .references(() => locations.id, { onDelete: "cascade" }),
  request_date: timestamp("request_date").defaultNow().notNull(),
  preferred_date: timestamp("preferred_date"),
  preferred_time: varchar("preferred_time", { length: 5 }), // Format: "HH:mm"
  acceptance_date: timestamp("acceptance_date"),
  completion_date: timestamp("completion_date"),
  agreed_price: decimal("agreed_price", { precision: 10, scale: 2 }),
  discount_code_id: uuid("discount_code_id").references(() => discountCodes.id, { onDelete: "set null" }),
  description: text("description"),
  // Campos de cancelación
  reason_cancelled: text("reason_cancelled"),
  cancelled_at: timestamp("cancelled_at"),
  // Campos de calificación
  rated: boolean("rated").default(false),
  rating: integer("rating"),
  rating_comment: text("rating_comment"),
  rating_images: text("rating_images").array(),
  rating_date: timestamp("rating_date"),
  // Campos de calificación del cliente
  technician_rated: boolean("technician_rated").default(false),
  client_rating: decimal("client_rating", { precision: 2, scale: 1 }),
  client_rating_date: timestamp("client_rating_date", { withTimezone: true }),
  // Campos de disputa
  dispute_reason: text("dispute_reason"),
  dispute_description: text("dispute_description"),
  dispute_status: disputeStatusEnum("dispute_status"),
  dispute_resolution: text("dispute_resolution"),
  dispute_images: text("dispute_images").array(),
  dispute_created_at: timestamp("dispute_created_at"),
  dispute_resolved_at: timestamp("dispute_resolved_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Imágenes de Servicio
export const serviceImages = pgTable("service_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  upload_date: timestamp("upload_date").defaultNow().notNull(),
});

// Tabla de Fotos de Trabajo
export const workPhotos = pgTable("work_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  photo_url: text("photo_url").notNull(),
  description: text("description"),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
});

// Tabla de Categorías
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  image_url: varchar("image_url", { length: 255 }),
});

// Tabla de Subcategorías
export const subcategories = pgTable("subcategories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  minimum_price: decimal("minimum_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  active_services: integer("active_services").notNull().default(0),
});

// Tabla de Documentos de Técnicos
export const technicianDocuments = pgTable("technician_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  carnet_identidad_anverso: varchar("carnet_identidad_anverso", {
    length: 255,
  }),
  carnet_identidad_reverso: varchar("carnet_identidad_reverso", {
    length: 255,
  }),
  factura_luz: varchar("factura_luz", { length: 255 }),
  certificaciones: jsonb("certificaciones").notNull().default([]),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Información Laboral de Técnicos
export const technicianWorkInfo = pgTable("technician_work_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  area_trabajo: jsonb("area_trabajo").notNull().default([]),
  anos_experiencia: varchar("anos_experiencia", { length: 255 }).notNull(),
  nombre_banco: varchar("nombre_banco", { length: 255 }),
  numero_cuenta: varchar("numero_cuenta", { length: 255 }),
  tipo_cuenta: varchar("tipo_cuenta", { length: 255 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Fotos de Perfil de Usuarios
export const userProfilePhotos = pgTable("user_profile_photos", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  photo_url: varchar("photo_url", { length: 255 }),
  upload_date: timestamp("upload_date").defaultNow().notNull(),
});

// Tabla de Ofertas
export const offers = pgTable("offers", {
  id: uuid("id").defaultRandom().primaryKey(),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  technician_id: uuid("technician_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  estimated_time: text("estimated_time").notNull(),
  dates_available: text("dates_available").array().notNull(),
  time_available: text("time_available").array().notNull(),
  selected_date: timestamp("selected_date"),
  selected_time: varchar("selected_time", { length: 5 }), // Format: "HH:mm"
  materials_included: boolean("materials_included").default(false),
  materials_description: text("materials_description"),
  service_acceptance_conditions: text(
    "service_acceptance_conditions"
  ).notNull(),
  status: offerStatusEnum("status").notNull().default("pending"),
  rejection_reason: text("rejection_reason"),
  expires_at: timestamp("expires_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Notificaciones de Servicio
export const serviceNotifications = pgTable("service_notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  technician_id: uuid("technician_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  data: jsonb("data").notNull(),
  status: notificationStatusEnum("status").notNull().default("unread"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  read_at: timestamp("read_at"),
});

// Tabla de Tokens Push
export const pushTokens = pgTable("push_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Variables del Sistema
export const systemVariables = pgTable("system_variables", {
  id: uuid("id").defaultRandom().primaryKey(),
  category: systemVariableCategoryEnum("category").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  value: text("value").notNull(),
  description: text("description"),
  is_public: boolean("is_public").default(true).notNull(),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de Comprobantes de Pago
export const paymentProofs = pgTable("payment_proofs", {
  id: uuid("id").defaultRandom().primaryKey(),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  technician_id: uuid("technician_id")
    .notNull()
    .references(() => users.id),
  proof_url: text("proof_url").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  uploaded_at: timestamp("uploaded_at").defaultNow().notNull(),
  confirmed_at: timestamp("confirmed_at"),
  metadata: jsonb("metadata"),
});

// Tabla de Códigos de Descuento
export const discountCodes = pgTable("discount_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  discount_type: discountTypeEnum("discount_type").notNull().default("percentage"),
  discount_value: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  trigger_reason: varchar("trigger_reason", { length: 100 }).notNull(),
  expires_at: timestamp("expires_at").notNull(),
  max_uses: integer("max_uses").notNull().default(1),
  current_uses: integer("current_uses").notNull().default(0),
  is_used: boolean("is_used").default(false).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Tabla de registro de uso de códigos de descuento
export const discountCodeUsage = pgTable("discount_code_usage", {
  id: uuid("id").defaultRandom().primaryKey(),
  discount_code_id: uuid("discount_code_id")
    .notNull()
    .references(() => discountCodes.id, { onDelete: "cascade" }),
  service_request_id: uuid("service_request_id")
    .notNull()
    .references(() => services.id, { onDelete: "cascade" }),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  original_amount: decimal("original_amount", { precision: 10, scale: 2 }).notNull(),
  discount_amount: decimal("discount_amount", { precision: 10, scale: 2 }).notNull(),
  final_amount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  applied_at: timestamp("applied_at").defaultNow().notNull(),
});
