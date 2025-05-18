create database if not exists RentHome;
use RentHome;

--RentHome tables
create table if not exists users(
    id int auto_increment primary key,
    name varchar(50) not null,
    surname varchar(50) not null,
    phone varchar(15) not null,
    email varchar(50) not null,
    password varchar(255) not null,
);

create table if not exists estates(
    id int auto_increment primary key,
    user_id int not null,
    address varchar(80) not null,
    city varchar(50) not null,
    postal_code varchar(10) not null,
    people int not null,
    max_person int not null,
    area decimal(10, 2) not null,
    foreign key (user_id) references users(id)
);

