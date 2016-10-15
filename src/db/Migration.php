<?php
/**
 * @link      https://craftcms.com/
 * @copyright Copyright (c) Pixel & Tonic, Inc.
 * @license   https://craftcms.com/license
 */

namespace craft\app\db;

use yii\db\ColumnSchemaBuilder;

/**
 * @inheritdoc
 *
 * @property Connection $db Connection the DB connection that this command is associated with.
 *
 * @author Pixel & Tonic, Inc. <support@pixelandtonic.com>
 * @since  3.0
 */
abstract class Migration extends \yii\db\Migration
{
    // Public Methods
    // =========================================================================

    // Schema Builder Methods
    // -------------------------------------------------------------------------

    /**
     * Creates a tinytext column for MySQL, or text column for others.
     *
     * @return ColumnSchemaBuilder the column instance which can be further customized.
     */
    public function tinyText()
    {
        if ($this->db->getDriverName() == Connection::DRIVER_MYSQL) {
            return $this->db->getSchema()->createColumnSchemaBuilder('tinytext');
        }

        return $this->text();
    }

    /**
     * Creates a mediumtext column for MySQL, or text column for others.
     *
     * @return ColumnSchemaBuilder the column instance which can be further customized.
     */
    public function mediumText()
    {
        if ($this->db->getDriverName() == Connection::DRIVER_MYSQL) {
            return $this->db->getSchema()->createColumnSchemaBuilder('mediumtext');
        }

        return $this->text();
    }

    /**
     * Creates a longtext column for MySQL, or text column for others.
     *
     * @return ColumnSchemaBuilder the column instance which can be further customized.
     */
    public function longText()
    {
        if ($this->db->getDriverName() == Connection::DRIVER_MYSQL) {
            return $this->db->getSchema()->createColumnSchemaBuilder('longtext');
        }

        return $this->text();
    }

    /**
     * Creates an enum column for MySQL and PostgreSQL, or a string column with a check constraint for others.
     *
     * @param string   $columnName The column name
     * @param string[] $values     The allowed column values
     *
     * @return ColumnSchemaBuilder the column instance which can be further customized.
     */
    public function enum($columnName, $values)
    {
        // Quote the values
        $schema = $this->db->getSchema();
        $values = array_map([$schema, 'quoteValue'], $values);

        if ($this->db->getDriverName() == Connection::DRIVER_MYSQL) {
            return $this->db->getSchema()->createColumnSchemaBuilder('enum', $values);
        }

        return $this->string()->check($schema->quoteColumnName($columnName).' in ('.implode(',', $values).')');
    }

    /**
     * Shortcut for creating a uid column
     *
     * @return ColumnSchemaBuilder the column instance which can be further customized.
     */
    public function uid()
    {
        return $this->char(36)->notNull()->defaultValue('0');
    }

    // CRUD Methods
    // -------------------------------------------------------------------------

    /**
     * @inheritdoc
     *
     * @param string  $table               The table that new rows will be inserted into.
     * @param array   $columns             The column data (name=>value) to be inserted into the table.
     * @param boolean $includeAuditColumns Whether to include the data for the audit columns
     *                                     (dateCreated, dateUpdated, uid).
     */
    public function insert($table, $columns, $includeAuditColumns = true)
    {
        echo "    > insert into $table ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->insert($table, $columns, $includeAuditColumns)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }

    /**
     * @inheritdoc
     *
     * @param string  $table               The table that new rows will be inserted into.
     * @param array   $columns             The column names.
     * @param array   $rows                The rows to be batch inserted into the table.
     * @param boolean $includeAuditColumns Whether `dateCreated`, `dateUpdated`, and `uid` values should be added to $columns.
     */
    public function batchInsert($table, $columns, $rows, $includeAuditColumns = true)
    {
        echo "    > batch insert into $table ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->batchInsert($table, $columns, $rows, $includeAuditColumns)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }

    /**
     * Creates and executes a command that will insert some given data into a table, or update an existing row
     * in the event of a key constraint violation.
     *
     * @param string  $table               The table that the row will be inserted into, or updated.
     * @param array   $keyColumns          The key-constrained column data (name => value) to be inserted into the table
     *                                     in the event that a new row is getting created
     * @param array   $updateColumns       The non-key-constrained column data (name => value) to be inserted into the table
     *                                     or updated in the existing row.
     * @param boolean $includeAuditColumns Whether `dateCreated`, `dateUpdated`, and `uid` values should be added to $columns.
     */
    public function upsert($table, $keyColumns, $updateColumns, $includeAuditColumns = true)
    {
        echo "    > insert or update into $table ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->upsert($table, $keyColumns, $updateColumns, $includeAuditColumns)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }

    /**
     * @inheritdoc
     *
     * @param string       $table               The table to be updated.
     * @param array        $columns             The column data (name => value) to be updated.
     * @param string|array $conditions          The condition that will be put in the WHERE part. Please
     *                                          refer to [[Query::where()]] on how to specify condition.
     * @param array        $params              The parameters to be bound to the command.
     * @param boolean      $includeAuditColumns Whether the `dateUpdated` value should be added to $columns.
     */
    public function update($table, $columns, $conditions = '', $params = [], $includeAuditColumns = true)
    {
        echo "    > update in $table ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->update($table, $columns, $conditions, $params, $includeAuditColumns)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }

    /**
     * Creates and executes a SQL statement for replacing some text with other text in a given table column.
     *
     * @param string $table   The table to be updated.
     * @param string $column  The column to be searched.
     * @param string $find    The text to be searched for.
     * @param string $replace The replacement text.
     */
    public function replace($table, $column, $find, $replace)
    {
        echo "    > replace \"$find\" with \"$replace\" in $table.$column ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->replace($table, $column, $find, $replace)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }

    // Schema Manipulation Methods
    // -------------------------------------------------------------------------

    /**
     * Creates and executes a SQL statement for dropping a DB table, if it exists.
     *
     * @param string $table The table to be dropped. The name will be properly quoted by the method.
     */
    public function dropTableIfExists($table)
    {
        echo "    > dropping $table if it exists ...";
        $time = microtime(true);
        $this->db->createCommand()
            ->dropTableIfExists($table)
            ->execute();
        echo " done (time: ".sprintf('%.3f', microtime(true) - $time)."s)\n";
    }
}
