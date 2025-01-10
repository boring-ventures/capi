import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  jsonb,
  foreignKey
} from "drizzle-orm/pg-core";

// Tabla de Usuarios
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 255 }).notNull(),
  status: varchar("status", { length: 255 }).notNull(),
});

// Tabla de Ubicaciones
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
});

// Tabla de Notificaciones
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  sent_date: timestamp("sent_date").defaultNow().notNull(),
  type: varchar("type", { length: 50 }).notNull(), // ENUM (Info, Offer, Alert)
});

// Tabla de Órdenes
export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  customer_id: uuid("customer_id")
    .notNull()
    .references(() => users.id),
  request_date: timestamp("request_date").defaultNow().notNull(),
  service_date: timestamp("service_date"),
  completion_date: timestamp("completion_date"),
  notes: text("notes"),
  status: varchar("status", { length: 50 }).notNull(), // ENUM (Requested, In Progress, Completed, Canceled)
});

// Tabla de Archivos Adjuntos
export const attachments = pgTable("attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  image: varchar("image", { length: 255 }).notNull(),
  upload_date: timestamp("upload_date").defaultNow().notNull(),
});

// Tabla de Chats
export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id),
});

// Tabla de Mensajes
export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  chat_id: uuid("chat_id")
    .notNull()
    .references(() => chats.id),
  sender_id: uuid("sender_id")
    .notNull()
    .references(() => users.id),
  message: text("message").notNull(),
  sent_date: timestamp("sent_date").defaultNow().notNull(),
  attached_image: varchar("attached_image", { length: 255 }),
});

// Tabla de Pagos
export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  order_id: uuid("order_id")
    .notNull()
    .references(() => orders.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  transaction_date: timestamp("transaction_date").defaultNow().notNull(),
  payment_method: varchar("payment_method", { length: 50 }).notNull(), // ENUM (Cash, QR)
  status: varchar("status", { length: 50 }).notNull(), // ENUM (Pending, Completed, Partial)
});

// Tabla de Servicios
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  base_price: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  estimated_duration: varchar("estimated_duration", { length: 50 }).notNull(),
});

// Tabla de Categorías
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Tabla de Servicios de Usuario (Relación muchos a muchos entre usuarios y servicios)
export const userServices = pgTable("user_services", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id),
  service_id: uuid("service_id")
    .notNull()
    .references(() => services.id),
});

// Tabla de Documentos de Técnicos
export const technicianDocuments = pgTable("technician_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  carnet_identidad_anverso: varchar("carnet_identidad_anverso", { length: 255 }),
  carnet_identidad_reverso: varchar("carnet_identidad_reverso", { length: 255 }),
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
  area_trabajo: varchar("area_trabajo", { length: 255 }).notNull(),
  anos_experiencia: varchar("anos_experiencia", { length: 255 }).notNull(),
  nombre_banco: varchar("nombre_banco", { length: 255 }).notNull(),
  numero_cuenta: varchar("numero_cuenta", { length: 255 }).notNull(),
  tipo_cuenta: varchar("tipo_cuenta", { length: 255 }).notNull(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Nueva tabla de Subcategorías
export const subcategories = pgTable("subcategories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  minimum_price: decimal("minimum_price", { precision: 10, scale: 2 }).notNull(),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
});
