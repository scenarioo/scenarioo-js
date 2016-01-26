'use strict';

var
    path = require('path'),
    assert = require('assert'),
    testHelper = require('../utils/testHelper'),
    mockWebdriver = require('../utils/mockWebdriver'),
    docuWriter = require('../../lib/scenarioDocuWriter.js');

before(function () {
    mockWebdriver.registerMockGlobals();
});

describe('scenarioDocuWriter', function () {

    /** let's set up some dummy objects **/
    var targetDir = './test/out/docu';

    var dummyBranch = {
        name: 'my unsafe branch name, will',
        description: 'my safe description'
    };

    var dummyUseCase = {
        name: 'use case name, toll!',
        description: 'some description with special chars ;) %&',
        status: 'success'
    };

    var dummyScenario = {
        name: ' some cool scenario name',
        description: 'scenario description',
        status: 'success'
    };

    describe('#start()', function () {

        it('should throw if name attribute is missing ', function () {
            var branch = {};

            assert.throws(function () {
                docuWriter.start(branch, 'build_name', targetDir);
            }, /Branch must contain attribute "name"/);
        });

        it('should write branch directory on start()', function () {
            docuWriter.start(dummyBranch, 'some build name', targetDir)
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will');
                    return testHelper.assertFileExists(expectedFilePath);
                });
        });

        it('should write branch.xml on start() with all attributes', function (done) {
            docuWriter.start(dummyBranch, 'some build name', targetDir)
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/branch.xml');

                    testHelper.assertXmlContent(expectedFilePath, {
                        branch: {
                            name: ['my unsafe branch name, will'],
                            description: ['my safe description']
                        }
                    }, done);
                })
                .catch(done);
        });
    });

    describe('#saveBuild()', function () {

        beforeEach(function (done) {
            docuWriter.start(dummyBranch, 'save_build_test', targetDir)
                .then(function () {
                    done();
                })
                .catch(done);
        });

        it('should throw if name attribute is missing ', function () {
            var build = {
                date: new Date(),
                status: 'successs'
            };

            assert.throws(function () {
                docuWriter.saveBuild(build, targetDir);
            }, /Build must contain attribute "name"/);
        });

        it('should throw if date attribute is missing ', function () {
            var build = {
                name: 'some build name',
                status: 'successs'
            };

            assert.throws(function () {
                docuWriter.saveBuild(build, targetDir);
            }, /Build must contain attribute "date"/);
        });

        it('should throw if status attribute is missing ', function () {
            var build = {
                name: 'some build name',
                date: new Date()
            };

            assert.throws(function () {
                docuWriter.saveBuild(build, targetDir);
            }, /Build must contain attribute "status"/);
        });

        it('should throw if status attribute is not "failed" or "success" ', function () {
            var build = {
                name: 'some build name',
                date: new Date(),
                status: 'something'
            };

            assert.throws(function () {
                docuWriter.saveBuild(build, targetDir);
            }, /Build must contain attribute "status" with value "success" or "failed"/);
        });

        it('should save mandatory fields correctly build.xml', function (done) {
            var buildDate = new Date();
            var build = {
                name: 'save_build_test',
                date: buildDate,
                status: 'failed'
            };

            docuWriter.saveBuild(build, targetDir)
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/save_build_test/build.xml');

                    testHelper.assertXmlContent(expectedFilePath, {
                        build: {
                            name: ['save_build_test'],
                            date: [buildDate.toString()],
                            status: ['failed']
                        }
                    }, done);
                })
                .catch(done);
        });

    });


    describe('#saveUseCase()', function () {

        beforeEach(function () {
            docuWriter.start(dummyBranch, 'some build name', targetDir);
        });

        it('should throw if name attribute is missing ', function () {
            var useCase = {
                status: 'successs'
            };

            assert.throws(function () {
                docuWriter.saveUseCase(useCase);
            }, /UseCase must contain attribute "name"/);
        });

        it('should throw if status attribute is missing ', function () {
            var useCase = {
                name: 'Some use case'
            };

            assert.throws(function () {
                docuWriter.saveUseCase(useCase);
            }, /UseCase must contain attribute "status"/);
        });

        it('should throw if status attribute is not "failed" or "success" ', function () {
            var useCase = {
                name: 'some useCase name',
                status: 'something'
            };

            assert.throws(function () {
                docuWriter.saveUseCase(useCase);
            }, /UseCase must contain attribute "status" with value "success" or "failed"/);
        });

        it('should create useCase directory', function () {
            return docuWriter.saveUseCase(dummyUseCase)
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll!');
                    return testHelper.assertFileExists(expectedFilePath);
                });
        });

        it('should create usecase.xml', function (done) {
            docuWriter.saveUseCase(dummyUseCase)
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/use+case+name%2C+toll!/usecase.xml');

                    testHelper.assertXmlContent(expectedFilePath, {
                        useCase: {
                            name: ['use case name, toll!'],
                            description: ['some description with special chars ;) %&'],
                            status: ['success']
                        }
                    }, done);
                })
                .catch(done);
        });

    });

    describe('#saveScenario()', function () {

        beforeEach(function () {
            docuWriter.start(dummyBranch, 'some build name', targetDir);
            return docuWriter.saveUseCase(dummyUseCase);
        });

        it('should throw if name attribute is missing ', function () {
            var scenario = {
                status: 'successs'
            };

            assert.throws(function () {
                docuWriter.saveScenario(scenario, 'a use case');
            }, /Scenario must contain attribute "name"/);
        });

        it('should throw if status attribute is missing ', function () {
            var scenario = {
                name: 'my super scenario'
            };

            assert.throws(function () {
                docuWriter.saveScenario(scenario, 'a use case');
            }, /Scenario must contain attribute "status"/);
        });

        it('should throw if status attribute is not "failed" or "success" ', function () {
            var scenario = {
                name: 'some scenario name',
                status: 'something'
            };

            assert.throws(function () {
                docuWriter.saveScenario(scenario, 'a use case');
            }, /Scenario must contain attribute "status" with value "success" or "failed"/);
        });

        it('should save scenario directory', function () {
            return docuWriter.saveScenario(dummyScenario, 'a use case')
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name');
                    return testHelper.assertFileExists(expectedFilePath);
                });
        });

        it('should save scenario.xml', function (done) {
            docuWriter.saveScenario(dummyScenario, 'a use case')
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/some+build+name/a+use+case/+some+cool+scenario+name/scenario.xml');

                    testHelper.assertXmlContent(expectedFilePath, {
                        scenario: {
                            name: [' some cool scenario name'],
                            description: ['scenario description'],
                            status: ['success']
                        }
                    }, done);

                })
                .catch(done);
        });

    });

    describe('#saveStep()', function () {

        beforeEach(function () {
            docuWriter.start(dummyBranch, 'myBuildName', targetDir);
        });

        it('should save a step', function () {
            return docuWriter.saveStep('my step')
                .then(function () {
                    var expectedFilePath = path.join(targetDir, 'my+unsafe+branch+name%2C+will/myBuildName/UseCaseDescription/ScenarioDescription/steps/000.xml');
                    return testHelper.assertFileExists(expectedFilePath);
                });
        });

        it('should save a step with default pagename', function () {
            return docuWriter.saveStep('my step')
                .then(function (stepData) {
                    assert.equal(stepData[0].page.name, '#_somepage');
                });
        });

        it('should save a step with custom pagename function', function () {
            docuWriter.registerPageNameFunction(function (url) {
                var pos = url.href.indexOf('#');
                if (pos > -1) {
                    return url.href.substring(pos + 1);
                } else {
                    return url.href;
                }
            });

            return docuWriter.saveStep('my step')
                .then(function (stepData) {
                    assert.equal(stepData[0].page.name, '_somepage');
                });
        });

        it('should save a step with additional misc data ("details")', function () {
            var dummyDetailData = {
                first: {
                    arbitrary: 1,
                    additional: 'data',
                    that: 'should be stored'
                },
                second: {
                    arbitrary: 2,
                    additional: 'data2',
                    that: 'should be stored2'
                }
            };

            return docuWriter.saveStep('my step', dummyDetailData)
                .then(function (savedStepData) {
                    var stepDescriptionDetails = savedStepData[0].metadata.details;
                    assert(stepDescriptionDetails);
                    assert.equal(stepDescriptionDetails.entry[0].key, 'first');
                    assert.deepEqual(stepDescriptionDetails.entry[0].value, {
                        arbitrary: 1,
                        additional: 'data',
                        that: 'should be stored'
                    });
                    assert.equal(stepDescriptionDetails.entry[1].key, 'second');
                    assert.deepEqual(stepDescriptionDetails.entry[1].value, {
                        arbitrary: 2,
                        additional: 'data2',
                        that: 'should be stored2'
                    });
                });
        });

        /**
         * At the moment, this does not work as expected.
         * //TODO: Discuss this with the scenarioo core team.
         */
        it('should save a step with additional misc data ("details") including arrays', function () {
            var dummyDetailData = {
                complexCustomInfo: [
                    'this is a more complex example of metadata',
                    'We expect this to end up in valid "entry/key/value" xml'
                ],
                moreComplexCustomInfo: [
                    {
                        attributeOne: 'valueOne',
                        attributeTwo: 'valueTwo'
                    },
                    {
                        attributeOne: 'valueOneOne',
                        attributeTwo: 'valueTwoTwo'
                    }
                ]
            };

            return docuWriter.saveStep('my step', dummyDetailData)
                .then(function (savedStepData) {
                    var stepDescriptionDetails = savedStepData[0].metadata.details;
                    assert(stepDescriptionDetails);
                });
        });

        it('should fail if step metadata details is not an object', function (done) {
            var dummyDetailData = [];
            docuWriter.saveStep('my step', dummyDetailData)
                .then(function () {
                    done('should not be successful!');
                }, function (err) {
                    assert(err.message.indexOf('Step metadata details must be an object') > -1);
                    done();
                })
                .catch(done);
        });
    });


});
