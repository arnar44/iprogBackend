
-- Schema hér

create table users ( 
    id SERIAL PRIMARY KEY,
    username varchar(64) UNIQUE NOT NULL,
    password varchar(64) NOT NULL,
    name varchar(64) NOT NULL,
    profile varchar(124)
);
