/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId("sections");

    collection.fields.add(
      new Field({
        type: "text",
        name: "color",
        required: false,
        max: 7,
      })
    );

    app.save(collection);
  },
  (app) => {
    const collection = app.findCollectionByNameOrId("sections");
    collection.fields.removeByName("color");
    app.save(collection);
  }
);
