/// <reference types="cypress" />

context('Assets', () => {

  const createFolder = (name) => {
    cy.then(() => {
      cy.get('.asset-folder-selector__add-button').click()
      cy.get('[data-testid="new-asset-folder"]').find('.sb-textfield__input').type(name)
      cy.intercept('GET', '/*/spaces/*/asset_folders*').as('getCreateFolder')
      cy.get('[data-testid="new-asset-folder"] > .sb-modal-footer > .sb-button--primary').click()
      cy.wait('@getCreateFolder')
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'Folder Created')
    }) 
  }

  const deleteFolder = () => {
    cy.then(() => {
      cy.get('.sb-minibrowser__list').find('.asset-folder-selector-item__menu').first().click()
      cy.get('#portal-wrapper').find('.sb-menu-item').contains('Delete').click()
      cy.get('[data-testid="delete-tab-modal-button"]').click()
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'The folder was successfully deleted')
    })
  }

  const createAsset = (file, fileName) => {
    cy.then(() => {
      cy.fixture(file, { encoding: null }).as(fileName)
      cy.get('#file').selectFile('@'+fileName, { action: 'select', force: true })
      cy.get('#assets-upload-modal').find('.sb-button--primary').click()
    })
  }

  const deleteAsset = () => {
    cy.then(() => {
      cy.get('.asset-folder-selector__button').eq(0).click()
      cy.get('.assets-list-item__container').first().find('.sb-button--primary').click({force: true})
      cy.get('.sb-menu-item').contains('Delete').click({force: true})
      cy.intercept('GET', '/*/spaces/*/assets*').as('getAssetsDelete')
      cy.get('[data-testid="delete-tab-modal-button"]').click()
      cy.wait('@getAssetsDelete')
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'The asset was successfully deleted') 
    })
  }

  before(() => {
    cy.intercept('GET', '/*/spaces/*/assets*').as('getAssets')
    cy.intercept('GET', '/*/spaces/*/asset_folders*').as('getFolders')

    cy.login()
    cy.visit('/#/me/spaces/')
    cy.get('[data-testid="column-space-item"]').eq(0).click()
    cy.get('[data-testid="app-sidebar-route__ListAssetsRoute"]').click()
    
    cy.wait('@getFolders')
    cy.wait('@getAssets')

    // Delete all existing folders
    cy.get('body').then(($body) => {      
      if ($body.find('.asset-folder-selector-item__menu').length) {
        cy.get('.asset-folder-selector-item__menu').should('exist').then(($folders) => {
          if ($folders.length > 0) {
            for (let i = 0; i < $folders.length; i++) {
              cy.get('.asset-folder-selector-item__menu').first().click()
              cy.get('#portal-wrapper').find('.sb-menu-item').contains('Delete').click()
              cy.intercept('GET', '/*/spaces/*/asset_folders*').as('getDeleteFolder')
              cy.get('[data-testid="delete-tab-modal-button"]').click()
              cy.wait('@getDeleteFolder')
            }
          }
        });
      }
      // Delete all existing assets
      if ($body.find('.assets-list-item__container').length) {
        cy.get('.assets-list-item__container').should('exist').then(($assets) => {
          if ($assets.length > 0) {
            for (let i = 0; i < $assets.length; i++) {
              cy.get('.assets-list-item__container').first().find('.sb-button--primary').click({force: true})
              cy.get('.sb-menu-item').contains('Delete').click({force: true})
              cy.intercept('GET', '/*/spaces/*/assets*').as('getAssetsDelete')
              cy.get('[data-testid="delete-tab-modal-button"]').click()
              cy.wait('@getAssetsDelete')
            }
          }
        });
      }
    }) 
  })

  beforeEach(() => {
    cy.viewport(1440, 606)
    cy.login()
    cy.visit('/#/me/spaces/')
    cy.get('[data-testid="column-space-item"]').eq(0).click()
    cy.get('[data-testid="app-sidebar-route__ListAssetsRoute"]').click()
  })

  describe('Folders', () => {
    it('Should create, rename, and delete a folder', () => {
      // Creating new folder
      
      createFolder('Test folder')
      
      // Renaming the created folder
      cy.get('.sb-minibrowser__list').find('.asset-folder-selector-item__menu').first().click()
      cy.get('#portal-wrapper').find('.sb-menu-item').contains('Rename').click()
      cy.get('#folder-name').clear().type('Renamed test folder')
      cy.intercept('GET', '/*/spaces/*/asset_folders*').as('getRenameFolder')
      cy.get('.asset-rename-modal').find('.sb-button--primary').click()
      cy.wait('@getRenameFolder')
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'Folder renamed')

      // Deleting the created folder
      deleteFolder()      
    })

    it('Should move a folder into another', () => {
      // Creating a parent folder
      createFolder('Parent folder')
      
      // Creating a child folder
      createFolder('Child folder')
      
      // Moving the child folder into the parent folder
      cy.get('.sb-minibrowser__list').find('.asset-folder-selector-item__menu').first().click()
      cy.get('#portal-wrapper').find('.sb-menu-item').contains('Move').click()
      cy.get('.asset-move-modal').find('.asset-folder-selector-item').contains('Parent folder').click()
      cy.get('.asset-move-modal').find('.sb-button--primary').click()
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'Folders updated')

      // Deleting folders
      deleteFolder()
    })
  })

  describe('Assets', () => {
    it('Should create, edit visibility and delete an asset', () => {
      //Creating an asset
      createAsset('storyblok.png', 'logoPng')
      
      // Editing asset visibility
      cy.get('.assets-list-item').first().click()
      cy.get('#asset-form-overview-private-asset').check({force: true})
      cy.get('.asset-detail__footer-actions > .sb-button--primary').click()
      cy.get('.assets-list-item').eq(0).should('contain.text', 'Private Asset')
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'Asset successfully updated') 
      
      // Deleting the asset
      deleteAsset()
    })

    it('Should delete and restore an asset', () => {
      //Creating an asset
      createAsset('storyblok.jpg', 'logoJpg')
      
      // Deleting the asset
      deleteAsset()

      // Restoring the deleted asset
      cy.intercept('GET', '/*/spaces/*/assets*').as('getAllAssets')
      cy.get('.asset-folder-selector__button').eq(1).click()
      cy.wait('@getAllAssets')
      cy.get('.assets-list-item__restore').eq(0).click()
      cy.intercept('GET', '/*/spaces/*/assets*').as('getAssetsRestore')
      cy.get('[data-testid="restore-asset-modal-button"]').click()
      cy.wait('@getAssetsRestore')
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'The asset was successfully restored') 
   
      // Deleting the asset
      deleteAsset()
    })

    it('Should permanently delete all', () => {
      //Creating an asset
      createAsset('storyblok.gif', 'logoGif')
      
      // Deleting the asset
      deleteAsset()

      // Permanently deleting the asset
      cy.get('.asset-folder-selector__button').eq(1).click()
      cy.get('.deleted-assets__trash-button').click()
      cy.get('[data-testid="perm-delete-asset-modal-button"]').click()
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'The assets were successfully permanently deleted') 
   
    })

    it('Should move an asset into a folder', () => {
      //Creating an asset
      createAsset('storyblok.jpeg', 'logoJpeg')
      
      // Creating a folder
      createFolder('Asset folder')
      
      // Moving the asset into the folder
      cy.get('.assets-list').find('.sb-menu-button').click({force: true})
      cy.get('.assets-list').find('.sb-menu-item').contains('Move to folder').click({force:true})
      cy.get('.asset-move-modal').find('.asset-folder-selector-item').contains('Asset folder').click()
      cy.get('.asset-move-modal').find('.sb-button--primary').click()
      cy.get('.vue-notification-group').should('be.visible').and('contain.text', 'Assets updated') 
      
      // Deleting folders
      deleteFolder()
      deleteAsset()
    })
  })
})