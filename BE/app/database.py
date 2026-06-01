import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/inventory",
)
print("DATABASE_URL =", DATABASE_URL)
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()#a connection is greated for a specific route request and is closed after the request is completed. This ensures that database connections are properly managed and released back to the pool when not in use.
    try:
        yield db# data is fetched and req and res
    finally:
        db.close()#after the request is completed, the database connection is closed to free up resources and prevent connection leaks. to avoid pool stacking and to ensure that connections are properly released back to the pool when not in use.

        #conection1
        #connecto 2
        #....