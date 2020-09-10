/**
 * handle data types elements
 */


export default {
  createDataType,
  deleteDataType,
  chooseOptionValue
};

/** Create a Data Type
 *
 * @param {Object} page
 * @param {Object} util
 * @param {Object} dataElements
 * @param {Object} assert
 * @param {string} dataTypeName
 */

async function createDataType(page, util, elements, dataElements, assert, dataTypeName) {

  // navigate to "Manage Data Types"
  await util.menu.select(page, 'Manage Data Types');

  // wait for button Create Data Type is loaded in view model
  await page.waitForSelector('body > div.main-content.container-fluid > table > tbody > tr > td > div > div.bx-rpm-buttons > a', { visible: true });

  // click Create Data Type button
  await page.click('body > div.main-content.container-fluid > table > tbody > tr > td > div > div.bx-rpm-buttons > a');

  // wait for Data Type Window is loaded in view model
  await page.waitForSelector('#DataTypeWindow', { visible: true });

  // find Name field and type a name for data type
  await page.type('#dataType_Name', dataTypeName);

  // find Description field and type a description for a data type
  await page.type('#dataType_Description', 'data.test.desc');

  await elements.typeInputField(page, '#dataType_Description', 'data.test.desc');

  // select a random value for System Type
  await dataElements.chooseOptionValue(page, '#systemType option', 'systemType');

  // click Save button
  await page.click('#saveButton');

  // after saving a data type data type window shouldn't be in view model
  await page.waitForSelector('#DataTypeWindow', { visible: false });

  // check error messages of the data type window
  // should not be visible at all and should not contain any errors
  const hasErrors = await page.evaluate(() => Array.from(document.querySelectorAll('#name > td.bx-errorMsg')).some((el) => el.textContent.trim()));
  assert.isFalse(hasErrors, 'should not show any errors');

  // check for the new entry in the list of data types
  const hasDataType = await page.$$eval('#bx-rpm-dataTypeGrid > table > tbody > tr', (rows, dataTypeName) => {
    return rows.some((tr) => tr.querySelector('td:nth-child(2)').textContent.trim() == dataTypeName);
  }, dataTypeName);

  assert.isTrue(hasDataType, 'should contain the new data type in the table');

  await page.screenshot({ path: 'Error2.png' });
}

async function deleteDataType(page, util, assert, elements) {

  // navigate to "Manage Data Types"
  await util.menu.select(page, 'Manage Data Types');

  // wait for button Create Data Type is loaded in view model
  await page.waitForSelector('body > div.main-content.container-fluid > table > tbody > tr > td > div > div.bx-rpm-buttons > a', { visible: true });

  // click filter icon for Description header
  await page.click('#bx-rpm-dataTypeGrid > table > thead > tr > th:nth-child(5) > div');

  // type in first input field description name of the data type in dropdown
  await elements.typeInputField(page, '#bx-rpm-dataTypeGrid div.t-animation-container div input[type=text]:nth-child(4)', 'data.test.desc');

  // click Filter button and wait for navigation
  await Promise.all([
    page.waitForNavigation(),
    page.click('#bx-rpm-dataTypeGrid > div.t-animation-container > div > button.t-button.t-button-icontext.t-button-expand.t-filter-button'),
  ]);

  // after clicking delete icon alert box is shown -> click Ok
  page.on('dialog', async dialog => { await dialog.accept(); });

  // click delete button
  await page.click('#bx-rpm-dataTypeGrid > table > tbody > tr > td:nth-child(6) > div > a.bx.bx-grid-function.bx-trash');

  // check for the new entry in the list of data types
  const dataTypeDesc = 'data.test.desc';
  const hasDataType = await page.$$eval('#bx-rpm-dataTypeGrid > table > tbody > tr', (rows, dataTypeDesc) => {
    return rows.some((tr) => tr.querySelector('td:nth-child(5)').textContent.trim() == dataTypeDesc);
  }, dataTypeDesc);

  assert.isFalse(hasDataType, 'should not contain the new data type in the table');

  await page.screenshot({path: 'filter.png'});
}

/** Choose an option from a select element
 *
 * @param {Object} page
 * @param {string} selector
 * @param {string} selectName
 */


async function chooseOptionValue(page, selector, selectName) {

  // gets values from select element and selects an option
  const optionValues = await page.evaluate((selector) => Array.from(document.querySelectorAll(selector), (val) => val.value), selector);

  const randomOptionValue = Math.floor(Math.random() * optionValues.length);

  await page.select(`select[name="${selectName}"]`, optionValues[randomOptionValue]);


  // if DateTime is chosen, selects a value for Pattern field
  if (optionValues[randomOptionValue] === 'DateTime') {

    const patternValues = await page.evaluate(() => Array.from(document.querySelectorAll('#pettern option'), (val) => val.value));

    const randomPatternValue = Math.floor(Math.random() * patternValues.length);

    await page.select('select[name="pattern"]', patternValues[randomPatternValue]);
  }
}