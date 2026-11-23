import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ArticleCategory {
  BURGER = 'BURGER',
  MENU = 'MENU',
  SIDE = 'SIDE',
  DRINK = 'DRINK',
  DESSERT = 'DESSERT',
  SAUCE = 'SAUCE',
}

export interface ArticleCustomizationOption {
  id: string;
  name: string;
  additionalPrice: number;
}

export interface ArticleCustomizationGroup {
  id: string;
  name: string;
  minSelections: number;
  maxSelections: number;
  includedSelections: number;
  options: ArticleCustomizationOption[];
}

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 120 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: null | string;

  @Column({
    type: 'enum',
    enum: ArticleCategory,
    default: ArticleCategory.BURGER,
  })
  category: ArticleCategory;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => Number.parseFloat(value),
    },
  })
  price: number;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: null | string;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ type: 'simple-array', nullable: true })
  allergens: null | string[];

  @Column({ type: 'jsonb', default: () => "'[]'::jsonb" })
  customizations: ArticleCustomizationGroup[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
