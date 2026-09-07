/// <reference path="../pb_data/types.d.ts" />

migrate(
  (app) => {
    const sections = new Collection({
      type: "base",
      name: "sections",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
        {
          type: "text",
          name: "name",
          required: true,
          max: 100,
        },
        {
          type: "number",
          name: "sort_order",
          required: false,
          min: 0,
        },
      ],
    });

    app.save(sections);

    const links = new Collection({
      type: "base",
      name: "links",
      listRule: "",
      viewRule: "",
      createRule: "",
      updateRule: "",
      deleteRule: "",
      fields: [
        {
          type: "text",
          name: "title",
          required: true,
          max: 100,
        },
        {
          type: "url",
          name: "url",
          required: true,
        },
        {
          type: "text",
          name: "icon",
          required: false,
          max: 255,
        },
        {
          type: "number",
          name: "sort_order",
          required: false,
          min: 0,
        },
        {
          type: "relation",
          name: "section",
          required: true,
          maxSelect: 1,
          collectionId: sections.id,
          cascadeDelete: true,
        },
      ],
    });

    app.save(links);

    const seedSections = [
      { name: "Infrastructure", sort_order: 1 },
      { name: "Media", sort_order: 2 },
      { name: "Development", sort_order: 3 },
    ];

    const sectionRecords = {};

    for (const seed of seedSections) {
      const record = new Record(sections);
      record.set("name", seed.name);
      record.set("sort_order", seed.sort_order);
      app.save(record);
      sectionRecords[seed.name] = record.id;
    }

    const seedLinks = [
      {
        title: "Proxmox",
        url: "https://proxmox.local",
        icon: "🖥️",
        sort_order: 1,
        section: "Infrastructure",
      },
      {
        title: "TrueNAS",
        url: "https://truenas.local",
        icon: "💾",
        sort_order: 2,
        section: "Infrastructure",
      },
      {
        title: "Plex",
        url: "https://plex.local",
        icon: "🎬",
        sort_order: 1,
        section: "Media",
      },
      {
        title: "Gitea",
        url: "https://gitea.local",
        icon: "🐙",
        sort_order: 1,
        section: "Development",
      },
    ];

    for (const seed of seedLinks) {
      const record = new Record(links);
      record.set("title", seed.title);
      record.set("url", seed.url);
      record.set("icon", seed.icon);
      record.set("sort_order", seed.sort_order);
      record.set("section", sectionRecords[seed.section]);
      app.save(record);
    }
  },
  (app) => {
    try {
      app.delete(app.findCollectionByNameOrId("links"));
    } catch (_) {
      // already removed
    }

    try {
      app.delete(app.findCollectionByNameOrId("sections"));
    } catch (_) {
      // already removed
    }
  }
);
