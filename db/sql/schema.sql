CREATE TABLE users ( 
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(64) NOT NULL
);

CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(64) NOT NULL,
    owner_id INTEGER REFERENCES users(id) NOT NULL,
    owner_username VARCHAR(64) REFERENCES users(username) NOT NULL,
    lineup TEXT NOT NULL, -- Could limit with varchar but no performance difference
    created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
    updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);