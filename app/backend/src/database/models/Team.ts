import { Model, DataTypes } from 'sequelize';
import db from '.';

class Example extends Model {
  public id: number;

  public teamName: string;
}

Example.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  teamName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  underscored: true,
  sequelize: db,
  modelName: 'team',
  timestamps: false,
});

export default Example;
