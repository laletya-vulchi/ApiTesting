/// <reference types="cypress" />
import { z } from 'zod';

beforeEach(() => {
    cy.fixture('loginRequestBody').then((requestBody) => {
        cy.apiRequestWithBody('POST', '/users/login', requestBody).then((response) => {
            expect(response.status).to.eql(200);
            cy.wrap(response.body.user.token).as('accessToken');
            // Cypress.env("accessToken",)
        });
    });
});

it('Sign up valid data and check the data', () => {
    //signing up with valid data
    cy.fixture('loginRequestBody').then((requestBody) => {
        requestBody.user.username = `jesh${Math.floor(Math.random() * 100)}`;
        requestBody.user.email = requestBody.user.username + '@apitest.com';
        cy.apiRequestWithBody('POST', '/users', requestBody).then((response) => {
            expect(response.status).to.equal(201);
            expect(response.body.user.email).to.equal(requestBody.user.email);
            expect(response.body.user.token).not.be.null;
        });
    });
});

it('login with the valid and invalid user', () => {
    //invalid user login check
    cy.fixture('loginRequestBody').then((requestBody) => {
        requestBody.user.password = 'password';
        cy.apiRequestWithBody('POST', '/users/login', requestBody).then((response) => {
            expect(response.status).to.equal(403);
            expect(response.body.errors['email or password'][0]).to.equal('is invalid');
        });
    });
});

//Testing of updating the user details wothout Token
it('negative test of updating the user details without Token', () => {
    cy.fixture('userRequestBody').then((requestBody) => {
        cy.apiRequestWithBody('PUT', '/user', requestBody).its('status').should('equal', 401);
    });

    cy.fixture('userRequestBody').then((requestBody) => {
        cy.apiRequestWithBody('PUT', '/user', requestBody, true).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.user.email).to.equal(Cypress.env('email'));
            expect(response.body.user.bio).to.equal('testing with automation');
            expect(response.body.user.image).to.equal(
                'https://c7.alamy.com/comp/2GWEPC5/an-orange-lily-flower-2GWEPC5.jpg',
            );
            expect(response.body.user.id).to.be.not.null;
        });
    });

    cy.loginToApplication();
    cy.get('a[href="/profile/laletyav"]').click();
    cy.url().should('equal', 'https://conduit.bondaracademy.com/profile/laletyav');
    cy.get('.user-img')
        .invoke('attr', 'src')
        .should('eq', 'https://c7.alamy.com/comp/2GWEPC5/an-orange-lily-flower-2GWEPC5.jpg');
    cy.get('div h4').invoke('text').should('eq', 'laletyav');
    cy.get('div p').invoke('text').should('eq', 'testing with automation');
});

//Adding comments
it('adding a Comment', function () {
    cy.request({
        url: `${Cypress.env('apiUrl')}/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments`,
        method: 'POST',
        body: {
            comment: {
                body: `Happy api Testing laletya ${Math.floor(Math.random() * 1000).toString()}`,
            },
        },
        headers: {
            Authorization: 'Token ' + this.accessToken,
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
    });
});

//Retreiving and deleting comments
it('Retrieving the comments and deleting', function () {
    //get comments without token results in empty array
    cy.apiRequestWithoutBody(
        'GET',
        '/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments',
    ).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.comments).to.be.empty;
    });

    //Getting the comments with token in header and delete
    let idsList = [];
    let idsListAfterDelete = [];
    let idToBeDeleted = 0;
    cy.apiRequestWithoutBody(
        'GET',
        '/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments',
        true,
    ).then((response) => {
        expect(response.status).to.equal(200);
        response.body.comments.forEach((element) => {
            idsList.push(element.id);
        });
        idToBeDeleted = idsList[0];
        if (idToBeDeleted) {
            cy.apiRequestWithoutBody(
                'DELETE',
                `/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments/${idToBeDeleted}`,
                true,
            )
                .its('status')
                .should('equal', 200);
            cy.apiRequestWithoutBody(
                'GET',
                '/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments',
                true,
            ).then((response) => {
                response.body.comments.forEach((element) => {
                    idsListAfterDelete.push(element.id);
                });
                expect(idsListAfterDelete).to.not.include(idToBeDeleted);
            });
        } else {
            cy.log('No comments found');
        }
    });
});

it('Creating an article', function () {
    //Attempting to create an article without token
    cy.fixture('articleBody').then((requestBody) => {
        requestBody.article.title = `Test article ${Date.now()}`;
        cy.apiRequestWithBody('POST', '/articles', requestBody).its('status').should('equal', 401);
    });

    //creating an article with access token
    cy.fixture('articleBody').then((requestBody) => {
        requestBody.article.title = `Test article ${Date.now()}`;
        cy.apiRequestWithBody('POST', '/articles', requestBody, true).then((response) => {
            expect(response.body.article.title).to.eq(requestBody.article.title);
        });
    });
});

it('fetching articles and verify response structure', function () {
    const schema = z.object({
        articles: z.array(
            z.object({
                slug: z.string(),
                title: z.string(),
                description: z.string(),
                body: z.string(),
                tagList: z.array(z.string()),
                createdAt: z.string(),
                updatedAt: z.string(),
                favorited: z.boolean(),
                favoritesCount: z.number(),
                author: z.object({
                    username: z.string(),
                    bio: z.string(),
                    image: z.string(),
                    following: z.boolean(),
                }),
            }),
        ),
        articlesCount: z.number(),
    });

    cy.request({
        url: `${Cypress.env('apiUrl')}/articles`,
        method: 'GET',
        qs: {
            author: 'laletyav',
            limit: 10,
            offset: 0,
        },
        headers: { Authorization: `Token ${this.accessToken}` },
    }).validateSchemaZod(schema);

    //retrieve a single article by slug and validate response
    cy.apiRequestWithoutBody('GET', 'articles/test-now-33118', true).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.article.slug).to.equal('test-now-33118');
        expect(response.body.article.author.username).to.equal('laletyav');
        expect(response.body.article.body).to.equal('testing the article modify');
    });
});

it('updating the article and check the data', function () {
    //update an article
    cy.request({
        url: `${Cypress.env('apiUrl')}/articles/test-now-33118`,
        method: 'PUT',
        body: {
            article: {
                title: 'test now',
                description: 'Updated the article now',
                body: 'testing the article modify',
                tagList: ['cypress'],
                slug: 'test-article-33118',
            },
        },
        headers: { Authorization: `Token ${this.accessToken}` },
    })
        .its('status')
        .should('equal', 200);

    //Get the article and chek the value is updated
    cy.apiRequestWithoutBody('GET', 'articles/test-now-33118', true).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.article.slug).to.equal('test-now-33118');
        expect(response.body.article.author.username).to.equal('laletyav');
        expect(response.body.article.body).to.equal('testing the article modify');
        expect(response.body.article.updatedAt).to.contains('2025-09-09');
    });
});

it('Deleting the article by slug id', function () {
    cy.fixture('articleBody').then((requestBody) => {
        requestBody.article.title = `Test article ${Date.now()}`;
        cy.apiRequestWithBody('POST', '/articles', requestBody, true).then((response) => {
            expect(response.body.article.title).to.eq(requestBody.article.title);
            const articleId = response.body.article.title.replaceAll(' ','-');
            cy.log(articleId)
            cy.apiRequestWithoutBody('DELETE', `articles/${articleId}-33118`, true)
                .its('status')
                .should('equal', 204);

            cy.apiRequestWithoutBody('GET', `articles/${articleId}-33118`, true)
                .its('status')
                .should('equal', 404);
        });
    });
});
