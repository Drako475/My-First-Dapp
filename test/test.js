const { assert } = require('chai')
const { default: Web3 } = require('web3')

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Darle nombre', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Storage')
    })
  })

  describe('images', async () => {
    let result, imageCount
    const hash = 'abc123'

    before(async () => {
      result = await decentragram.uploadImage(hash, 'Descripción de la imagen', {from: author})
      imageCount = await decentragram.imageCount()
    })

    it('Crear imagenes', async () => {
      // EXITOSO
      assert.equal(imageCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id es correcto')
      assert.equal(event.hash, hash, 'Hash es correcto')
      assert.equal(event.description, 'Descripción de la imagen', 'descripción es correcta')
      assert.equal(event.tipAmount, '0', 'tipo de monto es correcto')
      assert.equal(event.author, author, 'autor es correcto')

      //FALLA: Imagen no cuenta con hash
      await decentragram.uploadImage('', 'Descripción de la imagen', { from: author }).should.be.rejected;

      //FALLA: Imagen no cuenta con descripcion
      await decentragram.uploadImage('Imagen hash', '', { from: author }).should.be.rejected;
    })

      //Checkeamos la estructura
      it('listar imagenes', async () => {
        const image = await decentragram.images(imageCount)
        assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id es correcto')
      assert.equal(image.hash, hash, 'Hash es correcto')
      assert.equal(image.description, 'Descripción de la imagen', 'descripción es correcta')
      assert.equal(image.tipAmount, '0', 'tipo de monto es correcto')
      assert.equal(image.author, author, 'autor es correcto')
      })

      it('Permitir a los usuarios recomendar la imagen', async () => {
        //Rastrear el balance del author antes de pagar
        let oldAuthorBalance
        oldAuthorBalance = await web3.eth.getBalance(author)
        oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

        result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') })

        //EXITOSO
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id es correcto')
        assert.equal(event.hash, hash, 'Hash es correcto')
        assert.equal(event.description, 'Descripción de la imagen', 'descripción es correcta')
        assert.equal(event.tipAmount, '1000000000000000000', 'tipo de monto es correcto')
        assert.equal(event.author, author, 'autor es correcto')

        //Checkear que el autor reciva los fondos
        let newAuthorBalance
        newAuthorBalance = await web3.eth.getBalance(author)
        newAuthorBalance = new web3.utils.BN(newAuthorBalance)

        let tipImageOwner
        tipImageOwner = web3.utils.toWei('1', 'Ether')
        tipImageOwner = new web3.utils.BN(tipImageOwner)

        const expectedBalance = oldAuthorBalance.add(tipImageOwner)

        assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

        //FALLO: Intenta dar sugerencias a imagenes no existentes
        await decentragram.tipImageOwner(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;

      })
  })
})