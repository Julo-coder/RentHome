create database if not exists RentHome;
use RentHome;

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

create table if not exists tenants(
    id int auto_increment primary key,
    contract_number int not null,
    name varchar(50) not null,
    surname varchar(50) not null,
    phone varchar(15) not null,
    foreign key (contract_number) references contracts(contract_number)
);


create table if not exists contracts(
    contract_number int primary key,
    estate_id int not null,
    tenant_id int not null,
    rental_price decimal(10, 2) not null,
    rent int not null,
    charges decimal(10, 2) not null,
    foreign key (estate_id) references estates(id),
    foreign key (tenant_id) references tenants(id)
);

create table if not exists estate_equipments(
    estate_id int not null,
    estate_equipment varchar(50) not null,
    foreign key (estate_id) references estates(id)
);

create table if not exists estate_usage(
    estate_id int not null,
    water_usage decimal(10, 2) not null,
    electricity_usage decimal(10, 2) not null,
    gas_usage decimal(10, 2) not null,
    foreign key (estate_id) references estates(id)
);

