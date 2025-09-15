Feature: Article Creation

  Scenario: Create an article using API
    Given I have a valid token
    When I create a new article with a unique title
    Then the article should be created successfully