from typing import Generic, TypeVar, Type
from sqlalchemy.orm import Session
from ..models.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Base repository with common CRUD operations"""

    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db

    def save(self, entity: ModelType) -> ModelType:
        """Save entity to database"""
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def find_by_id(self, entity_id: int) -> ModelType | None:
        """Find entity by ID"""
        return self.db.query(self.model).filter(self.model.id == entity_id).first()

    def find_all(self) -> list[ModelType]:
        """Find all entities"""
        return self.db.query(self.model).all()

    def delete(self, entity: ModelType) -> None:
        """Delete entity from database"""
        self.db.delete(entity)
        self.db.commit()

    def delete_by_id(self, entity_id: int) -> bool:
        """Delete entity by ID, returns True if deleted"""
        entity = self.find_by_id(entity_id)
        if entity:
            self.delete(entity)
            return True
        return False
