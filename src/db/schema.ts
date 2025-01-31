import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  timestamp,
  jsonb,
  foreignKey,
  integer,
  pgEnum
} from "drizzle-orm/pg-core";

// Enums
export const serviceStatusEnum = pgEnum("service_status", [
  "created",
  "in_progress",
  "completed",
  "canceled",
  "disputed"
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
  reviewStatus: varchar("reviewStatus", { length: 255 }).notNull().default("pending"),
});

// Tabla de Ubicaciones
export const locations = pgTable("locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  address: varchar("address", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 6 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 6 }).notNull(),
});

// Tabla de Servicios
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  status: serviceStatusEnum("status").notNull().default("created"),
  category_id: uuid("category_id")
    .notNull()
    .references(() => categories.id),
  subcategory_id: uuid("subcategory_id")
    .notNull()
    .references(() => subcategories.id),
  client_id: uuid("client_id")
    .notNull()
    .references(() => users.id),
  technician_id: uuid("technician_id")
    .references(() => users.id),
  location_id: uuid("location_id")
    .notNull()
    .references(() => locations.id),
  request_date: timestamp("request_date").defaultNow().notNull(),
  acceptance_date: timestamp("acceptance_date"),
  agreed_price: decimal("agreed_price", { precision: 10, scale: 2 }),
  description: text("description").notNull(),
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

// Tabla de Categorías
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
});

// Tabla de Subcategorías
export const subcategories = pgTable("subcategories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  minimum_price: decimal("minimum_price", { precision: 10, scale: 2 }).notNull(),
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
