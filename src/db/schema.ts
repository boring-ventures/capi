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

export const workStatusEnum = pgEnum("work_status", [
  "pending",
  "on_way", 
  "working",
  "payment",
  "completed"
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

export const paymentMethodEnum = pgEnum("payment_method", [
  "",
  "cash",
  "qr"
]);

// Tabla de Usuarios
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("5.0"),
  fechaNacimiento: timestamp("fechaNacimiento"),
  contraseña: varchar("contraseña", { length: 255 }).notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  reviewStatus: varchar("reviewStatus", { length: 255 })
    .notNull()
    .default("pending"),
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
  subcategory_id: uuid("subcategory_id")
    .notNull()
    .references(() => subcategories.id, { onDelete: "cascade" }),
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
  preferred_date: timestamp("preferred_date").notNull(),
  preferred_time: varchar("preferred_time", { length: 5 }).notNull(), // Format: "HH:mm"
  acceptance_date: timestamp("acceptance_date"),
  completion_date: timestamp("completion_date"),
  agreed_price: decimal("agreed_price", { precision: 10, scale: 2 }),
  description: text("description").notNull(),
  // Campos de cancelación
  reason_cancelled: text("reason_cancelled"),
  cancelled_at: timestamp("cancelled_at"),
  // Campos de calificación
  rated: boolean("rated").default(false),
  rating: integer("rating"),
  rating_comment: text("rating_comment"),
  rating_images: text("rating_images").array(),
  rating_date: timestamp("rating_date"),
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
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id),
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
