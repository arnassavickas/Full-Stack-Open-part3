/* eslint-disable consistent-return */
require('dotenv').config();
const morgan = require('morgan');
const express = require('express');

const app = express();
const cors = require('cors');
const Person = require('./models/person');

app.use(cors());
app.use(express.json());
app.use(express.static('build'));
app.use(
  morgan((tokens, req, res) => {
    morgan.token('type', () => (req.method === 'POST' ? JSON.stringify(req.body) : ''));
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'),
      '-',
      tokens['response-time'](req, res),
      'ms',
      tokens.type(req, res),
    ].join(' ');
  })
);

app.post('/api/persons', (request, response, next) => {
  const newPerson = { ...request.body };

  if (!newPerson.name || !newPerson.number) {
    return response.status(400).json({
      error: 'name and/or number is missing',
    });
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request;

  const person = { number: body.number };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
  })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => {
    response.json(people);
  });
});

app.get('/info', (request, response) => {
  Person.find({}).then((people) => {
    response.send(`
    <div>
    <div>Phonebook has info for ${people.length} people</div>
    <div>${new Date()}</div>
    </div>
    `);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  // console.log(`Server running on port ${PORT}`);
});
