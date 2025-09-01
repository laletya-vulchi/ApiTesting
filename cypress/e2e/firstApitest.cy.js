/// <reference types="cypress" />

before(() => {
    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users/login',
        method: 'POST',
        body: {
            user: {
                email: Cypress.env('email'),
                password: Cypress.env('password'),
            },
        },
    }).then((response) => {
        expect(response.status).to.eql(200);
        cy.wrap(response.body.user.token).as('accessToken');
        // Cypress.env("accessToken",)
    });
});

it('Sign up valid data and check the data', () => {
    cy.visit('/');
    const username = `jesh${Math.floor(Math.random() * 100)}`;
    const email = username + '@apitest.com';
    const password = 'Elastic@123';

    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users',
        method: 'POST',
        body: {
            user: {
                email: email,
                password: password,
                username: username,
            },
        },
    }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.user.email).to.equal(email);
        expect(response.body.user.token).not.be.null;
    });
    cy.url().should('equal', 'https://conduit.bondaracademy.com/');
    cy.get('[routerlink="/login"]').click();
    cy.loginToApplication();
    cy.url().should('equal', 'https://conduit.bondaracademy.com/');
    cy.get('li.nav-item a.nav-link').invoke('text').should('contains', `${username}`);
});
it('login with the valid and invalid user', () => {
    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users/login',
        method: 'POST',
        body: {
            user: {
                email: Cypress.env('email'),
                password: Cypress.env('password'),
            },
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.user.email).to.equal(Cypress.env('email'));
        expect(response.body.user.token).not.be.null;
    });

    //invalid user login check
    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users/login',
        method: 'POST',
        failOnStatusCode: false,
        body: {
            user: {
                email: 'email@testingapi.com',
                password: 'password',
            },
        },
    }).then((response) => {
        expect(response.status).to.equal(403);
        expect(response.body.errors['email or password'][0]).to.equal('is invalid');
    });
});
it('negative test of updating the user details without Token', () => {
    cy.request({
        url: 'https://conduit.bondaracademy.com/profile/laletyav',
        method: 'GET',
    })
        .its('status')
        .should('equal', 200);

    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/users/login',
        method: 'POST',
        body: {
            user: {
                email: Cypress.env('email'),
                password: Cypress.env('password'),
            },
        },
    }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.user.email).to.equal(Cypress.env('email'));
        expect(response.body.user.token).not.be.null;
        const accessToken = 'Token ' + response.body.user.token;
        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/user',
            method: 'PUT',
            failOnStatusCode: false,
            body: {
                user: {
                    image: 'https://c7.alamy.com/comp/2GWEPC5/an-orange-lily-flower-2GWEPC5.jpg',
                    username: Cypress.env('username'),
                    bio: 'testing through automation',
                    email: Cypress.env('email'),
                    password: Cypress.env('password'),
                },
            },
        })
            .its('status')
            .should('equal', 401);

        cy.request({
            url: 'https://conduit-api.bondaracademy.com/api/user',
            method: 'PUT',
            body: {
                user: {
                    image: 'https://c7.alamy.com/comp/2GWEPC5/an-orange-lily-flower-2GWEPC5.jpg',
                    username: Cypress.env('username'),
                    bio: 'testing with automation',
                    email: Cypress.env('email'),
                    password: Cypress.env('password'),
                },
            },
            headers: {
                Authorization: accessToken,
            },
        }).then((response) => {
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
it('adding a Comment', function () {
    cy.visit(
        'https://conduit.bondaracademy.com/article/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1',
    );
    cy.wait(500);
    cy.get('div')
        .contains('comment')
        .invoke('text')
        .should('contain', 'Sign in or sign up to add comments on this article.');

    cy.loginToApplication();
    cy.get('.preview-link h1').contains('Discover Bondar Academy').click();
    cy.wait(500);
    cy.get('[placeholder="Write a comment..."]').should('be.visible');
    cy.get('[type="submit"]').should('not.be.disabled');

    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/Discover-Bondar-Academy:-Your-Gateway-to-Efficient-Learning-1/comments',
        method: 'POST',
        body: {
            comment: {
                body: `Happy api Testing laletya ${Date.now().toString()}`,
            },
        },
        headers: {
            Authorization: 'Token ' + this.accessToken,
        },
    }).as('addingComments');
    cy.get('@addingComments').then((response) => {
        expect(response.status).to.equal(200);
        const commentId = response.body.comment.id;
        cy.reload();
        cy.get('p.card-text').invoke('text').should('contain', 'Happy api Testing laletya');
    });
});
it.only('Retrieving the comments and deleting', () => {
    cy.intercept(
        'GET',
        'https://conduit-api.bondaracademy.com/api/articles/The-value-of-pre-recorded-video-classes.-The-most-efficient-approach-to-tranfer-the-knowledge-1/comments',
        { fixture: 'commentForArticleTwo.json' },
    );
    cy.visit(
        'https://conduit.bondaracademy.com/article/The-value-of-pre-recorded-video-classes.-The-most-efficient-approach-to-tranfer-the-knowledge-1',
    );

    cy.request({
        url: 'https://conduit-api.bondaracademy.com/api/articles/The-value-of-pre-recorded-video-classes.-The-most-efficient-approach-to-tranfer-the-knowledge-1/comments',
        method: 'GET',
    }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.comment).to.be.not.null;
    });
});
