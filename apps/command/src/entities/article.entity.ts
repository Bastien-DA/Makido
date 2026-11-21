import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
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

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string | null;

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
            from: (value: string) => parseFloat(value),
        },
    })
    price: number;

    @Column({ type: 'varchar', nullable: true })
    imageUrl: string | null;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ type: 'simple-array', nullable: true })
    allergens: string[] | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}