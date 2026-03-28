import { Sequelize, DataTypes, Model, Optional } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialect = (process.env.DB_DIALECT || 'sqlite') as any;
const storage = process.env.DB_STORAGE || './inventory.sqlite';

export const sequelize = new Sequelize({
  dialect,
  storage: dialect === 'sqlite' ? storage : undefined,
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
});

// Models
export class Product extends Model {
  public sku!: string;
  public name!: string;
  public description!: string;
  public customer!: string;
  public physicalStock!: number;
  public availableStock!: number;
}

Product.init({
  sku: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  customer: { type: DataTypes.STRING },
  physicalStock: { type: DataTypes.INTEGER, defaultValue: 0 },
  availableStock: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { sequelize, modelName: 'product' });

export class Transaction extends Model {
  public id!: number;
  public sku!: string;
  public quantity!: number;
  public customer!: string;
  public status!: 'CREATED' | 'DRAFT' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
  public type!: 'IN' | 'OUT';
}

Transaction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  sku: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  customer: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'transaction' });

export class InventoryLog extends Model {
  public id!: number;
  public type!: 'IN' | 'OUT' | 'ADJUST';
  public sku!: string;
  public quantity!: number;
  public previousStock!: number;
  public newStock!: number;
}

InventoryLog.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  type: { type: DataTypes.STRING, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  previousStock: { type: DataTypes.INTEGER, allowNull: false },
  newStock: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, modelName: 'inventory_log' });

export const initDb = async () => {
  await sequelize.sync();
};
