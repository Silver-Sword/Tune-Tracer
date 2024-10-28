// Purpose: for defining the kind of update that an online entity can experience during a subscription
export enum UpdateType {
    ADD = 1,                            // the entity was added to the pool of entities
    CHANGE = 2,                         // the data in an entity was changed
    DELETE = 3,                         // the entity was deleted from the pool of entities
};