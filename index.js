const { response } = require("express");
const morgan = require("morgan");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(
  morgan(function (tokens, req, res) {
    morgan.token("type", function (req, res) {
      //console.log(req);
      return req.method === "POST" ? JSON.stringify(req.body) : "";
    });
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.type(req, res),
    ].join(" ");
  })
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

app.post("/api/persons", (request, response) => {
  const newPerson = { ...request.body };

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: "name and/or number is missing",
    });
  }

  if (persons.find((person) => person.name === newPerson.name) !== undefined) {
    return response.status(400).json({
      error: "name already exists in the phonebook",
    });
  }

  let generateId;
  do {
    generateId = Math.floor(Math.random() * 10000) + 1;
    //repeat if id already exists
  } while (persons.find((person) => person.id === generateId) !== undefined);
  newPerson.id = generateId;
  persons = [...persons, newPerson];
  response.json(newPerson);
});

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`
    <div>
      <div>Phonebook has info for ${persons.length} people</div>
      <div>${new Date()}</div>
    </div>
  `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
1;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
