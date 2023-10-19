<?php
/**
 * @link https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license https://craftcms.github.io/license/
 */

return [
    [
        'id' => '1000',
        'name' => 'Test 1',
        'handle' => 'test1',
        'type' => 'channel',
        'enableVersioning' => false,
        'propagationMethod' => 'all',
        'uid' => 'section-1000---------------------uid',
        'entryTypes' => ['1000'],
    ],
    [
        'id' => '1001',
        'name' => 'Test 2',
        'handle' => 'test2',
        'type' => 'channel',
        'enableVersioning' => false,
        'propagationMethod' => 'all',
        'dateDeleted' => (new DateTime('now'))->sub(new DateInterval('P3M5D'))->format('Y-m-d'),
        'uid' => 'section-1001---------------------uid',
        'entryTypes' => ['1001'],
    ],
    [
        'id' => '1002',
        'name' => 'Test 3',
        'handle' => 'test3',
        'type' => 'channel',
        'enableVersioning' => false,
        'propagationMethod' => 'all',
        'dateDeleted' => (new DateTime('now'))->sub(new DateInterval('P3M5D'))->format('Y-m-d'),
        'uid' => 'section-1002---------------------uid',
        'entryTypes' => ['1002'],
    ],
    [
        'id' => '1003',
        'name' => 'With URI 1',
        'handle' => 'withUri1',
        'type' => 'channel',
        'enableVersioning' => false,
        'propagationMethod' => 'all',
        'uid' => 'section-1003---------------------uid',
        'entryTypes' => ['1003'],
    ],
    [
        'id' => '1004',
        'name' => 'With versioning',
        'handle' => 'withVersioning',
        'type' => 'channel',
        'enableVersioning' => true,
        'propagationMethod' => 'all',
        'uid' => 'section-1004---------------------uid',
        'entryTypes' => ['1004'],
    ],
    [
        'id' => '1005',
        'name' => 'Single',
        'handle' => 'single',
        'type' => 'single',
        'enableVersioning' => true,
        'propagationMethod' => 'all',
        'uid' => 'section-1005---------------------uid',
        'entryTypes' => ['1005'],
    ],
    [
        'id' => '1006',
        'name' => 'Test Eager Loading',
        'handle' => 'testEagerLoading',
        'type' => 'channel',
        'enableVersioning' => false,
        'propagationMethod' => 'all',
        'uid' => 'section-1006---------------------uid',
        'entryTypes' => ['1006'],
    ],
];
